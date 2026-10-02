import { ARENA_LEFT, GROUND_Y } from '../../../constants';
import { getArenaRight } from '../../bosses/registry';
import { bandedGradient } from '../pixelArt';
import { drawArtieLair } from './lairs/artie';
import { drawVictorLair } from './lairs/victor';
import { drawErnieLair } from './lairs/ernie';
import { drawHectorLair } from './lairs/hector';
import { drawBarryLair } from './lairs/barry';
import { drawOscarLair } from './lairs/oscar';
import type { Enemy } from '../../../types';
import type { GameState } from '../../core/state';

/** Decorative backdrops for each boss arena (drawn in world coordinates). */
export const drawCustomBossArena = (
  ctx: CanvasRenderingContext2D,
  stageId: string,
  frame: number,
  /** Where the wind is being sucked toward (Hector's hurricane), if anywhere. */
  windTargetX: number | null = null,
  /** The game (for arenas that change as the fight goes: Dale's pharmacy walls). */
  state?: GameState,
) => {
  const arenaLeft = ARENA_LEFT;
  const arenaRight = getArenaRight(stageId);
  const arenaW = arenaRight - arenaLeft;
  const groundY = GROUND_Y;
  const ceilingY = 100;

  ctx.save();

  switch (stageId) {
    case 'Artie Avalanche':
      drawArtieLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame);
      break;
    case 'Victor Volcano':
      drawVictorLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame);
      break;
    case 'Ernie Earthquake':
      drawErnieLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame);
      break;
    case 'Hector Hurricane':
      drawHectorLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, windTargetX);
      if (state) drawHectorFilth(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state.hectorFilthShown);
      break;
    case 'Drug Trade Dale':
      {
        // (more of it wrecked every time his truck's been through: what's standing goes crooked, then goes over, and
        // lies where it fell: see drawDaleDisarray and drawDaleRuin)
        const d = state ? state.enemies.find(e => e.type === 'boss') ?? state.deadBoss ?? undefined : undefined;
        // (each thing in the place goes when the truck gets to it on its way through, not when it sets off: the runs
        // that are over, and this one too wherever its front's already been)
        // (counted by how far each run actually got: a truck wrecked halfway leaves the far half as it was)
        const reach = d?.truckReach ?? [];
        const runsAt = (x: number) => { let n = 0; for (const r of reach) if (r >= x) n++; return n; };
        drawDaleArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame, runsAt);
        drawDaleRuin(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, Math.min(1, runsAt(arenaLeft + arenaW / 2) / DALE_RUIN_PASSES));
        drawDaleDisarray(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, runsAt);
      }
      if (state) drawDaleWalls(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state.enemies.find(e => e.type === 'boss') ?? state.deadBoss ?? undefined, state.doorState === 'done');
      break;
    case 'Blackout Barry':
      drawBarryLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame);
      break;
    case 'Oily Oscar':
      drawOscarLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame);
      break;
    default:
      break;
  }

  ctx.restore();
};

/* =========================================================================
 * 5. DRUG TRADE DALE: DALE'S PHARMACY, ALBUQUERQUE
 * The inside of his pharmacy: mint tile, strip lights, aisles of pills, the
 * Rx counter at the back under a neon sign. The glass front doors (left) and
 * the back wall (right) are in his delivery truck's way: the first time it
 * comes through, each of them comes down (and stays down).
 * ========================================================================= */
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/**
 * How the truck's left the place, run by run (`n`: how many times it's been through): what's still standing goes
 * crooked first (a shelf leaning, the portrait askew, a sign swinging off one chain), then over it all goes, and
 * lands here: the shelving units down across the floor with their stock spilled out of them, the signs down, the
 * blood pressure machine on its side, the wet floor sign kicked over, pill bottles and boxes and baskets everywhere.
 * Nothing's taken away: it's all still there, just where a truck put it.
 */
const DALE_FALL = { gondola0: 4, gondola1: 5, signs: 4, portrait: 4, bp: 3, wet: 1 };
const daleTilt = (n: number, fallsAt: number) => (n >= fallsAt ? -1 : Math.min(1, Math.max(0, n - (fallsAt - 3)) / 2));

const drawDaleDisarray = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, runsAt: (x: number) => number) => {
  if (runsAt(left) <= 0) return;
  ctx.save();
  const stock = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7', '#F8FAFC', '#EC4899'];
  // A shelving unit down on its side across the floor, its stock spilled out in front of it
  const downShelf = (x: number, gw: number, dir: number, seed: number) => {
    const h = 54;
    ctx.save(); ctx.translate(x, bottom); ctx.rotate(dir * 0.06);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(dir > 0 ? 0 : -210, -h, 210, h);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(dir > 0 ? 0 : -210, -h, 210, 5);
    ctx.fillStyle = '#78716C'; for (let s = 1; s < 4; s++) ctx.fillRect((dir > 0 ? 0 : -210) + s * 50, -h, 4, h);
    ctx.fillStyle = '#57534E'; ctx.fillRect(dir > 0 ? 0 : -210, -4, 210, 4);
    ctx.restore();
    for (let k = 0; k < 26; k++) {
      const hsh = hash(seed + k * 3.3);
      const bx = x + dir * (10 + hash(seed + k) * 240), bw = 8 + hsh * 8, bh = 6 + hash(seed + k + 9) * 10;
      ctx.save(); ctx.translate(bx, bottom - bh / 2 - (k % 3) * 3); ctx.rotate((hsh - 0.5) * 2.4);
      ctx.fillStyle = stock[Math.floor(hsh * stock.length)]; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.restore();
    }
    void gw;
  };
  if (daleTilt(runsAt(left + 150), DALE_FALL.gondola0) < 0) downShelf(left + 60, 180, 1, 11);
  if (daleTilt(runsAt(left + 345), DALE_FALL.gondola1) < 0) downShelf(left + 420, 150, -1, 29);
  // The aisle signs, down
  if (runsAt(left + 150) >= DALE_FALL.signs) {
    for (const [sx, color, text, rot] of [[left + 170, '#2563EB', 'PAIN RELIEF', 0.2], [left + 330, '#7C3AED', 'SLEEP AIDS', -0.35]] as [number, string, string, number][]) {
      ctx.save(); ctx.translate(sx, bottom - 12); ctx.rotate(rot);
      ctx.fillStyle = color; ctx.fillRect(-50, -11, 100, 22);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 6px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, 0, 3);
      ctx.restore();
    }
  }
  // Dale's portrait, face down on the floor, the frame cracked
  if (runsAt(left + 345) >= DALE_FALL.portrait) {
    ctx.save(); ctx.translate(left + 300, bottom - 6); ctx.rotate(0.08);
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(-36, -8, 72, 9); ctx.fillStyle = '#78350F'; ctx.fillRect(-36, -8, 72, 2);
    ctx.restore();
  }
  // The blood pressure machine, on its side
  if (runsAt(left + 475) >= DALE_FALL.bp) {
    ctx.save(); ctx.translate(left + 520, bottom); ctx.rotate(-Math.PI / 2 + 0.05);
    ctx.fillStyle = '#1E40AF'; ctx.fillRect(0, 0, 50, 120); ctx.fillStyle = '#93C5FD'; ctx.fillRect(8, 10, 34, 20);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(12, 60, 26, 26);
    ctx.restore();
  }
  // The wet floor sign, kicked over
  if (runsAt(left + 262) >= DALE_FALL.wet) {
    ctx.save(); ctx.translate(left + 230, bottom - 4); ctx.rotate(1.4);
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(0, -40); ctx.lineTo(12, 0); ctx.fill();
    ctx.restore();
  }
  // Pill bottles, boxes, baskets everywhere (more every run)
  for (let k = 0; k < 80; k++) {
    const x = left + 20 + hash(k * 7.7 + 3) * (right - left - 40), hsh = hash(k * 1.9 + 5);
    if (k >= runsAt(x) * 14) continue;
    ctx.save(); ctx.translate(x, bottom - 3 - (k % 4)); ctx.rotate((hsh - 0.5) * 3);
    if (k % 9 === 0) { ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 2; ctx.strokeRect(-9, -6, 18, 10); }
    else if (k % 3 === 0) { ctx.fillStyle = '#F59E0B'; ctx.fillRect(-3, -6, 6, 9); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-3, -8, 6, 2); }
    else { ctx.fillStyle = stock[Math.floor(hsh * stock.length)]; ctx.fillRect(-5, -4, 10, 7); }
    ctx.restore();
  }
  // Pills spilled in drifts, glinting
  ctx.fillStyle = '#FDE68A';
  for (let k = 0; k < 160; k++) { const x = left + 30 + hash(k * 3.1 + 40) * (right - left - 60); if (k < runsAt(x) * 26) ctx.fillRect(Math.round(x), bottom - 2 - Math.round(hash(k + 77) * 3), 2, 2); }
  ctx.restore();
};

/** How many runs of the truck through the place it takes to leave it a smoldering ruin. */
const DALE_RUIN_PASSES = 6;

/**
 * Dale's pharmacy, coming apart a little more every time his truck comes through it (looks only: the fight's the
 * same). `k` 0..1, how far gone it is: cracks up the walls and tiles off them, a strip light out; then ceiling tiles
 * down with wiring hanging out of the holes and sparking, scorch up the walls, junk on the floor; then holes right
 * through the back wall with the night outside, fires along the floor; then the ceiling mostly gone, soot over
 * everything, smoke rolling under what's left of the roof, fires everywhere, embers going up.
 */
const drawDaleRuin = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, k: number) => {
  if (k <= 0) return;
  const w = right - left;
  const at = (i: number, s: number) => left + 30 + hash(i * 13.7 + s) * (w - 60);
  ctx.save();
  // Cracks up the back wall
  ctx.strokeStyle = 'rgba(41, 37, 36, 0.8)'; ctx.lineWidth = 1.5;
  for (let c = 0; c < Math.round(k * 14); c++) {
    let cx = at(c, 1), cy = bottom - 20 - hash(c + 4) * 200;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) { cx += (hash(c * 7 + s) - 0.5) * 26; cy -= 16 + hash(c + s) * 14; ctx.lineTo(cx, cy); }
    ctx.stroke();
  }
  // Tiles off the wall, the plaster behind
  ctx.fillStyle = '#A8A29E';
  for (let t = 0; t < Math.round(k * 22); t++) ctx.fillRect(Math.round(at(t, 2) / 18) * 18, bottom - 18 - Math.floor(hash(t + 9) * 9) * 18, 18, 18);
  // Scorch climbing the walls from the floor (stepped, darker at the foot)
  if (k > 0.2) {
    const h = (k - 0.2) * 360;
    for (let b = 0; b < 5; b++) { ctx.fillStyle = `rgba(28, 25, 23, ${(0.12 + b * 0.06) * Math.min(1, (k - 0.2) * 2)})`; ctx.fillRect(left, bottom - h * (1 - b / 5), w, h * (1 - b / 5)); }
  }
  // Holes through the ceiling: tiles down, the dark above, wiring hanging out and sparking
  const holes = k > 0.25 ? Math.round((k - 0.15) * 8) : 0;
  for (let i = 0; i < holes; i++) {
    const hx = at(i, 3), hw = 50 + hash(i + 30) * 60;
    ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.moveTo(hx - hw / 2, top); for (let s = 0; s <= 6; s++) ctx.lineTo(hx - hw / 2 + (hw / 6) * s, top + 18 + hash(i * 5 + s) * 18); ctx.lineTo(hx + hw / 2, top); ctx.fill();
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx, top + 20); ctx.quadraticCurveTo(hx + 10, top + 50, hx + 4 + Math.sin(frame * 0.05 + i) * 3, top + 70); ctx.stroke();
    if ((frame + i * 17) % 50 < 4) { ctx.fillStyle = '#FDE047'; ctx.fillRect(hx + 2, top + 68, 4, 4); ctx.fillRect(hx - 2, top + 72, 2, 2); ctx.fillRect(hx + 7, top + 74, 2, 2); }
  }
  // Junk on the floor: plaster, glass, pill bottles, a toppled sign
  if (k > 0.15) {
    for (let j = 0; j < Math.round(k * 30); j++) {
      const jx = at(j, 5), s = 4 + hash(j + 60) * 8;
      ctx.fillStyle = ['#D6D3D1', '#78716C', '#F97316', '#E5E7EB', '#B91C1C'][j % 5];
      ctx.fillRect(Math.round(jx), Math.round(bottom - s), Math.round(s * 1.5), Math.round(s));
    }
  }
  // Soot over everything, and the ceiling mostly gone at the end
  if (k > 0.65) {
    const a = (k - 0.65) / 0.35;
    ctx.fillStyle = `rgba(12, 10, 9, ${0.18 * a})`; ctx.fillRect(left, top, w, bottom - top);
    ctx.fillStyle = `rgba(12, 10, 9, ${0.9 * a})`; ctx.fillRect(left, top, w, 34);
    // smoke rolling along under the roof
    for (let i = 0; i < 9; i++) {
      const sx = left + ((i * 97 + frame * (0.3 + hash(i) * 0.4)) % (w + 120)) - 60, sy = top + 30 + hash(i + 3) * 60;
      ctx.fillStyle = `rgba(41, 37, 36, ${0.45 * a})`; ctx.beginPath(); ctx.arc(sx, sy, 30 + hash(i + 7) * 30, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Fires along the floor (more of them, bigger, the further gone it is), and embers going up off them
  const fires = k > 0.45 ? Math.round((k - 0.4) * 16) : 0;
  for (let i = 0; i < fires; i++) {
    const fx = at(i, 6), fh = 14 + hash(i + 80) * 22 * k + Math.sin(frame * 0.3 + i) * 3;
    for (const [fw, hh, c] of [[12, fh, '#DC2626'], [8, fh * 0.75, '#F97316'], [4, fh * 0.45, '#FDE047']] as [number, number, string][]) {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(fx - fw, bottom); ctx.quadraticCurveTo(fx - fw * 0.5, bottom - hh * 0.6, fx + Math.sin(frame * 0.2 + i) * 2, bottom - hh); ctx.quadraticCurveTo(fx + fw * 0.5, bottom - hh * 0.6, fx + fw, bottom); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#FDBA74';
    for (let e = 0; e < 2; e++) { const q = ((frame * 1.5 + i * 40 + e * 70) % 140) / 140; ctx.globalAlpha = 1 - q; ctx.fillRect(Math.round(fx + Math.sin(q * 9 + i) * 10), Math.round(bottom - 10 - q * 160), 2, 2); }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
};



const drawDaleArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number,
  runsAt: (x: number) => number = () => 0,
) => {
  // 0. Above the ceiling: the roof's dark underside, ducts and joists
  ctx.fillStyle = '#292524'; ctx.fillRect(left - 40, top - 200, w + 80, 200);
  ctx.fillStyle = '#44403C'; for (let x = left - 40; x < right + 40; x += 48) ctx.fillRect(x, top - 200, 10, 200);
  ctx.fillStyle = '#78716C'; ctx.fillRect(left - 40, top - 60, w + 80, 22);
  ctx.fillStyle = '#57534E'; for (let x = left; x < right; x += 90) ctx.fillRect(x, top - 64, 6, 30);
  // 1. The back wall: cream up top, mint tile below
  ctx.fillStyle = '#EEF0E2'; ctx.fillRect(left, top, w, bottom - top);
  const tileTop = bottom - 190;
  ctx.fillStyle = '#9ED3C0'; ctx.fillRect(left, tileTop, w, bottom - tileTop);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
  for (let y = tileTop; y < bottom; y += 18) { ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); }
  for (let x = left; x < right; x += 18) { ctx.beginPath(); ctx.moveTo(x, tileTop); ctx.lineTo(x, bottom); ctx.stroke(); }
  ctx.fillStyle = '#2F7D6A'; ctx.fillRect(left, tileTop - 6, w, 6);

  // 2. The ceiling: drop tiles and strip lights (one on the blink)
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(left, top, w, 34);
  ctx.strokeStyle = '#A8A29E'; for (let x = left; x < right; x += 60) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + 34); ctx.stroke(); }
  for (let i = 0; i < 4; i++) {
    const lx = left + 70 + i * 170;
    // (knocked loose by the runs through: more of them out, hanging off one end, swinging)
    const runs = runsAt(lx + 55);
    const loose = runs >= 1 + i;
    const on = !(i === 2 && Math.floor(frame / 9) % 11 < 2) && !(runs >= 2 + i * 2);
    if (loose) {
      ctx.save(); ctx.translate(lx, top + 36); ctx.rotate(0.5 + Math.sin(frame * 0.05 + i) * 0.08);
      ctx.fillStyle = on ? '#FEFCE8' : '#A8A29E'; ctx.fillRect(0, -4, 110, 8);
      ctx.restore();
      if (on && (frame + i * 13) % 37 < 3) { ctx.fillStyle = '#FDE047'; ctx.fillRect(lx + 4, top + 40, 3, 3); }
      continue;
    }
    ctx.fillStyle = on ? '#FEFCE8' : '#A8A29E'; ctx.fillRect(lx, top + 34, 110, 8);
    if (on) {
      // (its pool of light down the wall, in steps)
      for (let k = 0; k < 5; k++) {
        const a = 0.32 * (1 - k / 5), y0 = top + 42 + k * 43.6, y1 = y0 + 43.6, s0 = k / 5, s1 = (k + 1) / 5;
        ctx.fillStyle = `rgba(254, 252, 232, ${a.toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(lx - 40 * s0, y0); ctx.lineTo(lx + 110 + 40 * s0, y0); ctx.lineTo(lx + 110 + 40 * s1, y1); ctx.lineTo(lx - 40 * s1, y1); ctx.fill();
      }
    }
  }

  // 3. Hanging signs down the aisles
  const hangSign = (x: number, text: string, color: string) => {
    // (swinging off one chain once it's been hit, down on the floor after: see drawDaleDisarray)
    const runs = runsAt(x);
    if (runs >= DALE_FALL.signs) return;
    if (runs >= 2) {
      ctx.save(); ctx.translate(x + 30, top + 34); ctx.rotate(0.6 + Math.sin(frame * 0.06) * 0.1);
      ctx.strokeStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.stroke();
      ctx.fillStyle = color; ctx.fillRect(-80, 26, 100, 22);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 6px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, -30, 40);
      ctx.restore();
      return;
    }
    ctx.strokeStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(x - 30, top + 34); ctx.lineTo(x - 30, top + 60); ctx.moveTo(x + 30, top + 34); ctx.lineTo(x + 30, top + 60); ctx.stroke();
    ctx.fillStyle = color; ctx.fillRect(x - 50, top + 60, 100, 22);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 6px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, x, top + 74);
  };
  hangSign(left + 150, 'PAIN RELIEF', '#2563EB');
  hangSign(left + 340, 'SLEEP AIDS', '#7C3AED');

  // 4. The aisles: shelves of boxes and bottles
  const gondola = (x: number, gw: number, fallsAt: number, dir: number) => {
    // (leaning more every run, then over: it's down on the floor, see drawDaleDisarray; a clean patch on the wall
    // where it stood)
    const runs = runsAt(x + gw / 2);
    const lean = daleTilt(runs, fallsAt);
    if (lean < 0) { ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(x, bottom - 214, gw, 214); return; }
    ctx.save();
    if (lean > 0) { const px = dir > 0 ? x + gw : x; ctx.translate(px, bottom); ctx.rotate(dir * lean * 0.22); ctx.translate(-px, -bottom); }
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x, bottom - 210, gw, 210);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(x, bottom - 214, gw, 6);
    for (let s = 0; s < 4; s++) {
      const sy = bottom - 200 + s * 50;
      ctx.fillStyle = '#78716C'; ctx.fillRect(x + 4, sy + 40, gw - 8, 4);
      for (let k = 0; k < Math.floor((gw - 12) / 16); k++) {
        const hsh = hash(x + s * 31 + k * 7);
        const bx = x + 8 + k * 16, bh = 18 + hsh * 18;
        ctx.fillStyle = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7', '#F8FAFC', '#EC4899'][Math.floor(hsh * 8)];
        // (shaken off the shelves, more of the stock gone every run)
        if (hash(x + s * 13 + k * 3) < runs * 0.15) continue;
        if (hsh > 0.5) ctx.fillRect(bx, sy + 40 - bh, 12, bh);
        else { ctx.beginPath(); ctx.roundRect(bx + 1, sy + 40 - bh, 10, bh, 3); ctx.fill(); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(bx + 2, sy + 40 - bh - 3, 8, 3); }
      }
    }
    ctx.fillStyle = '#DC2626'; ctx.fillRect(x + gw / 2 - 20, bottom - 232, 40, 16);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 5px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SALE!', x + gw / 2, bottom - 221);
    ctx.restore();
  };
  gondola(left + 60, 180, DALE_FALL.gondola0, 1);
  gondola(left + 270, 150, DALE_FALL.gondola1, -1);

  // 5. The pharmacy counter at the back: pill shelves, Rx, a neon sign, Dale's face
  const cx = right - 290, cw = 250;
  const counterRuns = runsAt(cx + cw / 2);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(cx, bottom - 290, cw, 200);
  for (let s = 0; s < 4; s++) {
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(cx + 10, bottom - 250 + s * 40, cw - 20, 3);
    for (let k = 0; k < 14; k++) {
      // (knocked off the shelves, more every run; the ones left tipped over)
      if (hash(k * 5 + s * 11 + 3) < counterRuns * 0.13) continue;
      const tip = hash(k + s * 7 + 1) < counterRuns * 0.1;
      ctx.fillStyle = hash(k + s * 20) > 0.3 ? '#F59E0B' : '#F8FAFC';
      if (tip) { ctx.fillRect(cx + 12 + k * 16, bottom - 256 + s * 40, 16, 10); continue; }
      ctx.fillRect(cx + 14 + k * 16, bottom - 266 + s * 40, 10, 16); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(cx + 14 + k * 16, bottom - 270 + s * 40, 10, 4);
    }
  }
  ctx.save();
  ctx.shadowColor = '#22C55E'; ctx.shadowBlur = 14;
  const neon = Math.floor(frame / 50) % 9 !== 0;
  ctx.fillStyle = neon ? '#4ADE80' : '#14532D';
  ctx.font = 'bold 18px "Press Start 2P", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PHARMACY', cx + cw / 2, bottom - 306);
  ctx.fillRect(cx - 34, bottom - 330, 10, 30); ctx.fillRect(cx - 44, bottom - 320, 30, 10);
  ctx.restore();
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(cx + 20, bottom - 90 - 30, 70, 20); ctx.fillStyle = '#B91C1C'; ctx.fillRect(cx + 150, bottom - 90 - 30, 70, 20);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 6px "Press Start 2P", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('DROP OFF', cx + 55, bottom - 106); ctx.fillText('PICK UP', cx + 185, bottom - 106);
  // The counter itself
  ctx.fillStyle = '#E7E5E4'; ctx.fillRect(cx - 10, bottom - 90, cw + 20, 90);
  ctx.fillStyle = '#6D28D9'; ctx.fillRect(cx - 10, bottom - 90, cw + 20, 10);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(cx - 10, bottom - 6, cw + 20, 6);
  ctx.fillStyle = '#4C1D95'; ctx.font = 'bold 26px serif'; ctx.fillText('Rx', cx + cw / 2, bottom - 36);
  // Dale's framed portrait (crooked after a run or two; down on the floor after that, a clean patch where it hung)
  const px = left + 345;
  const portraitRuns = runsAt(px);
  if (portraitRuns >= DALE_FALL.portrait) { ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(px - 30, bottom - 330, 60, 72); ctx.fillStyle = '#57534E'; ctx.fillRect(px - 1, bottom - 336, 2, 4); }
  else {
  ctx.save(); if (portraitRuns >= 1) { ctx.translate(px, bottom - 334); ctx.rotate(0.12 * Math.min(portraitRuns, 3)); ctx.translate(-px, -(bottom - 334)); }
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(px - 30, bottom - 330, 60, 72);
  ctx.fillStyle = '#6D28D9'; ctx.fillRect(px - 24, bottom - 324, 48, 60);
  ctx.fillStyle = '#F5CBA7'; ctx.beginPath(); ctx.arc(px, bottom - 300, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111'; ctx.fillRect(px - 11, bottom - 316, 22, 7); ctx.fillStyle = '#FF007F'; ctx.fillRect(px - 9, bottom - 304, 18, 4);
  ctx.fillStyle = '#FDE047'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.fillText('PHARMACIST', px, bottom - 268); ctx.fillText('OF EVERY MONTH', px, bottom - 262);
  ctx.restore();
  }

  // 6. Odds and ends: a blood pressure machine, a security mirror, a wet floor sign
  const bpx = left + 450;
  if (runsAt(bpx + 25) < DALE_FALL.bp) {
    ctx.fillStyle = '#1E40AF'; ctx.fillRect(bpx, bottom - 120, 50, 120); ctx.fillStyle = '#93C5FD'; ctx.fillRect(bpx + 8, bottom - 110, 34, 20);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(bpx + 12, bottom - 60, 26, 26); ctx.fillStyle = '#FFFFFF'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.fillText('FREE', bpx + 25, bottom - 45);
  }
  ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.arc(right - 30, top + 70, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'; ctx.beginPath(); ctx.arc(right - 30, top + 70, 18, 0, Math.PI * 2); ctx.fill();
  if (runsAt(right - 30) >= 2) { ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; for (let c = 0; c < 5; c++) { const a = c * 1.3; ctx.beginPath(); ctx.moveTo(right - 34, top + 66); ctx.lineTo(right - 34 + Math.cos(a) * 18, top + 66 + Math.sin(a) * 18); ctx.stroke(); } }
  if (runsAt(left + 262) < DALE_FALL.wet) {
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(left + 250, bottom); ctx.lineTo(left + 262, bottom - 40); ctx.lineTo(left + 274, bottom); ctx.fill();
    ctx.fillStyle = '#111'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.fillText('WET', left + 262, bottom - 14);
  }

  // 7. The floor: checkerboard linoleum, the slab under it
  ctx.fillStyle = '#57534E'; ctx.fillRect(left - 40, bottom, w + 80, 70);
  ctx.fillStyle = '#78716C'; ctx.fillRect(left - 40, bottom, w + 80, 4);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(left, bottom - 14, w, 14);
  ctx.fillStyle = '#6B7280';
  for (let x = left, k = 0; x < right; x += 16, k++) ctx.fillRect(x, bottom - 14 + (k % 2) * 7, 16, 7);
  ctx.textAlign = 'left';
};

/**
 * The pharmacy's front doors (left) and back wall (right), over the arena's own walls: standing, cracking as the
 * truck's about to hit, blowing apart (glass and aluminum, or brick and plaster, flying, a cloud of dust), then a
 * ragged hole with the night outside and rubble along the bottom. (Only once the door's shut behind Meathead: till
 * then the way in is the way in.)
 */
const drawDaleWalls = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, boss: Enemy | undefined, doorShut: boolean) => {
  if (!boss) return;
  const lx = left - 40, rx = right;
  const outside = (x: number, w: number, y1: number) => {
    bandedGradient(ctx, x, y1, w, bottom - y1, ['#2E1A55', '#5A2A62', '#A8406E', '#D07068', '#F4A261'], 10);
  };
  // --- The front doors
  if (doorShut) {
    const down = boss.leftWallDownAt;
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(lx, top, 40, bottom - top);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(lx + 34, top, 6, bottom - top);
    const dy = bottom - 180;
    if (down === undefined) {
      // Sliding glass doors, ENTER and all
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(lx, dy, 40, 180);
      ctx.fillStyle = 'rgba(147, 197, 253, 0.55)'; ctx.fillRect(lx + 4, dy + 6, 32, 174);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(lx + 8, dy + 12, 4, 60);
      ctx.fillStyle = '#16A34A'; ctx.fillRect(lx + 6, dy + 80, 28, 10); ctx.fillStyle = '#FFFFFF'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ENTER', lx + 20, dy + 87); ctx.textAlign = 'left';
    } else {
      // Gone, and a lot more than the doors: the truck's taken the front of the place out to well over head height,
      // a ragged hole up the wall with the night outside, brick showing round its edges, chunks of it still coming
      // down after, and the glass and the wall in a heap across the floor
      const t = frame - (boss.leftThroughAt ?? down);
      const n = Math.max(1, boss.leftThroughs ?? 1);
      // (bigger every time it's come through: higher up the wall, further into the shop)
      const hy = bottom - Math.min(380, 330 + (n - 1) * 15);
      const W = Math.min(190, 130 + (n - 1) * 15);
      drawBreach(ctx, lx, W, hy, top, bottom, 1, n, outside);
      // (the door frame, bent over in the hole, a few teeth of glass still in it)
      ctx.fillStyle = '#9CA3AF';
      ctx.save(); ctx.translate(lx + 34, dy - 20); ctx.rotate(0.5); ctx.fillRect(0, 0, 5, 110); ctx.restore();
      ctx.save(); ctx.translate(lx + 4, dy + 40); ctx.rotate(-0.3); ctx.fillRect(0, 0, 4, 70); ctx.restore();
      ctx.fillStyle = 'rgba(191, 219, 254, 0.8)';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(lx + k * 10, dy + 2); ctx.lineTo(lx + k * 10 + 8, dy + 2); ctx.lineTo(lx + k * 10 + 3, dy + 14 + hash(k) * 24); ctx.fill(); }
      // (chunks of the wall over it letting go, one after another, for a while after)
      for (let k = 0; k < 5; k++) {
        const t0 = 8 + k * 14, u = t - t0;
        if (u < 0) { ctx.fillStyle = '#D6D3D1'; ctx.fillRect(lx + 4 + (k % 3) * 11, hy + 2 + (k % 2) * 6, 12, 9); continue; }
        const y = Math.min(bottom - 10, hy + 6 + 0.45 * u * u);
        ctx.save(); ctx.translate(lx + 8 + (k % 3) * 11 + u * 0.6, y); if (y < bottom - 10) ctx.rotate(u * 0.15);
        ctx.fillStyle = k % 2 ? '#B91C1C' : '#D6D3D1'; ctx.fillRect(-6, -4, 12, 9); ctx.restore();
      }
      // (glass glittering in the heap)
      ctx.fillStyle = 'rgba(191, 219, 254, 0.8)'; for (let k = 0; k < 12; k++) ctx.fillRect(lx + 20 + k * 11, bottom - 4 - (k % 2) * 2, 4, 2);
      burst(ctx, t, lx + 20, dy + 90, 1, bottom, 'glass');
      burst(ctx, t - 3, lx + 20, hy + 120, 1, bottom, 'brick');
      burst(ctx, t - 6, lx + 80, hy + 200, 1, bottom, 'brick');
    }
  }
  // --- The back wall (the truck coming at it: it bulges and cracks just before)
  const down = boss.rightWallDownAt;
  if (down === undefined) {
    const front = boss.truckActive && boss.truckX !== undefined ? boss.truckX + 350 : -1e9;
    const k = Math.max(0, Math.min(1, (front - (rx - 110)) / 110));
    ctx.save(); if (k > 0) ctx.translate((Math.random() - 0.5) * k * 4, 0);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(rx, top, 40, bottom - top);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(rx, top, 6, bottom - top);
    // The staff door
    ctx.fillStyle = '#78716C'; ctx.fillRect(rx + 4, bottom - 150, 32, 150);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(rx + 6, bottom - 130, 28, 14);
    ctx.fillStyle = '#111827'; ctx.font = '3px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EMPLOYEES', rx + 20, bottom - 124); ctx.fillText('ONLY', rx + 20, bottom - 119); ctx.textAlign = 'left';
    if (k > 0) {
      ctx.strokeStyle = '#44403C'; ctx.lineWidth = 1.5;
      for (let c = 0; c < Math.ceil(k * 6); c++) { ctx.beginPath(); ctx.moveTo(rx + 4, bottom - 80); ctx.lineTo(rx + 4 + hash(c) * 30, bottom - 80 + (hash(c + 5) - 0.5) * 160); ctx.stroke(); }
    }
    ctx.restore();
  } else {
    // A ragged hole right through it, bigger every time the truck's been out through it, the night outside, brick in
    // its edges, the wall and ceiling over it coming down after, a heap of it across the floor
    const t = frame - (boss.rightThroughAt ?? down);
    const n = Math.max(1, boss.rightThroughs ?? 1);
    const ry = bottom - Math.min(320, 190 + (n - 1) * 25);
    const RW = Math.min(150, 50 + (n - 1) * 20);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(rx, top, 40, bottom - top);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(rx, top, 6, bottom - top);
    drawBreach(ctx, rx + 40, RW, ry, top, bottom, -1, n, outside);
    burst(ctx, t, rx + 20, ry + 90, -1, bottom, 'brick');
    burst(ctx, t - 4, rx - 30, ry + 150, -1, bottom, 'brick');
  }
};

/**
 * A hole the truck's torn through an end of the shop: from the wall (`edgeX`, the outside face) in toward the middle
 * (`dir` +1 from the left, -1 from the right), `w` across at the floor and up to `hy`, ragged all round, the night
 * outside through it, brick in its torn edges; and the wall, plaster, shelving and glass of it in a heap across the
 * floor, more of it the more times (`n`) it's been through.
 */
const drawBreach = (ctx: CanvasRenderingContext2D, edgeX: number, w: number, hy: number, top: number, bottom: number, dir: number, n: number,
  outside: (x: number, w: number, y1: number) => void) => {
  const X = (d: number) => edgeX + dir * d;
  const reachAt = (y: number) => 40 + (w - 40) * Math.min(1, (y - hy) / 160) - hash(Math.floor(y / 14) + 70 + n) * 26;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(X(0), hy);
  for (let k = 0; k <= 10; k++) ctx.lineTo(X(k * 4), hy + 6 + hash(k + 60 + n) * 26);
  for (let y = hy + 20; y <= bottom; y += 14) ctx.lineTo(X(reachAt(y)), y);
  ctx.lineTo(X(0), bottom); ctx.closePath(); ctx.clip();
  outside(Math.min(X(0), X(w + 10)), w + 10, hy);
  ctx.restore();
  // (brick in the torn edges)
  ctx.fillStyle = '#B91C1C'; for (let k = 0; k < 9; k++) ctx.fillRect(Math.min(X((k % 3) * 13), X((k % 3) * 13 + 11)), hy + 4 + Math.floor(k / 3) * 7 + (k % 2) * 3, 11, 5);
  ctx.fillStyle = '#991B1B';
  for (let y = hy + 24; y < bottom - 20; y += 14) { const ex = X(reachAt(y)); ctx.fillRect(ex - 2, y, 10, 5); if (hash(y + n) > 0.5) ctx.fillRect(ex + dir * 4, y + 6, 8, 4); }
  ctx.fillStyle = '#D6D3D1'; for (let y = hy + 30; y < bottom - 30; y += 28) { const ex = X(reachAt(y)); ctx.fillRect(ex + dir * 6, y - 3, 6, 10); }
  // (the heap across the floor, deeper and wider every run)
  const heap = Math.min(w + 60, 120 + n * 50);
  ctx.fillStyle = '#78716C'; for (let d = 0; d < heap; d += 9) { const hgt = 8 + (1 - d / heap) * (6 + n * 4) + (Math.floor(d / 9) % 3) * 3; ctx.fillRect(Math.min(X(d), X(d + 10)), bottom - hgt, 10, hgt); }
  ctx.fillStyle = '#D6D3D1'; for (let d = 4; d < heap; d += 11) ctx.fillRect(Math.min(X(d), X(d + 9)), bottom - 12 - (1 - d / heap) * (4 + n * 4) - (Math.floor(d / 11) % 2) * 5, 9, 6);
  ctx.fillStyle = '#B91C1C'; for (let d = 8; d < heap; d += 13) ctx.fillRect(Math.min(X(d), X(d + 9)), bottom - 10 - (1 - d / heap) * (3 + n * 3) - (Math.floor(d / 13) % 2) * 4, 9, 5);
  // (a toppled shelf and pills spilled, once it's been through a few times)
  if (n >= 3) {
    ctx.save(); ctx.translate(X(w * 0.6), bottom - 14); ctx.rotate(dir * 0.25);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(-50, -10, 100, 12); ctx.fillStyle = '#A8A29E'; ctx.fillRect(-50, 0, 100, 3);
    ctx.restore();
    ctx.fillStyle = '#F97316'; for (let k = 0; k < 10; k++) ctx.fillRect(X(w * 0.4 + k * 9), bottom - 4 - (k % 2) * 2, 4, 3);
  }
};

/**
 * The wall coming apart, t frames after the hit: bits flying the way the truck's going and landing on the floor, a
 * cloud of dust rolling out and settling. (Worked out from t, so it plays the same however it's drawn.)
 */
const burst = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, dir: number, floor: number, kind: 'glass' | 'brick') => {
  if (t < 0 || t > 120) return;
  // The flash of the hit
  if (t < 5) { ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - t * 0.15})`; ctx.beginPath(); ctx.arc(x, y, 90, 0, Math.PI * 2); ctx.fill(); }
  // Bits flying
  for (let i = 0; i < 22; i++) {
    const vx = dir * (2 + hash(i) * 9) - 1.5, vy = -(3 + hash(i + 50) * 9);
    const px = x + vx * t, py = Math.min(floor - 4, y - 60 + hash(i + 9) * 120 + vy * t + 0.3 * t * t);
    ctx.save(); ctx.translate(px, py);
    if (py < floor - 4) ctx.rotate(t * (0.2 + hash(i + 3) * 0.3));
    if (kind === 'glass') {
      ctx.fillStyle = i % 3 === 0 ? '#9CA3AF' : 'rgba(191, 219, 254, 0.9)';
      ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(6, -2); ctx.lineTo(-1, 6); ctx.fill();
    } else {
      ctx.fillStyle = i % 3 === 0 ? '#E7E5E4' : i % 3 === 1 ? '#B91C1C' : '#991B1B';
      ctx.fillRect(-6, -3, 12, 6);
    }
    ctx.restore();
  }
  // The dust
  for (let i = 0; i < 7; i++) {
    const r = 20 + t * (0.8 + hash(i + 20) * 0.8);
    const a = Math.max(0, 0.45 - t / 260);
    ctx.fillStyle = `rgba(214, 211, 209, ${a})`;
    ctx.beginPath(); ctx.arc(x + dir * (i * 14 + t * 0.6) - 20, floor - 20 - hash(i) * 80 - t * 0.2, r, 0, Math.PI * 2); ctx.fill();
  }
};

/**
 * Hector's arena, filthier the more poop logs have gone into his wind: smears of it up the windows and the pylons with
 * runs down them, a sludge of it building up along the deck with logs and lumps in it, a brown haze over the lot,
 * flies over the worst of it, stink coming up off it, and the telemetry on the glass with something to say about the
 * air. `f`: 0 clean .. 1 as bad as it gets. Every mark has its own place and turns up at its own level, so it builds.
 */
const drawHectorFilth = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, f: number) => {
  if (f < 0.01) return;
  const w = right - left;
  const h = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const BROWN = ['#4A2F12', '#5C3A17', '#6B4423', '#3B2410'];
  ctx.save();
  ctx.beginPath(); ctx.rect(left, top, w, bottom - top); ctx.clip();
  // Smears up the glass and the pylons, each with a run down from it (longer the longer it's been that bad)
  for (let i = 0; i < 34; i++) {
    const at = h(i) * 0.95;
    if (f < at) continue;
    const k = Math.min(1, (f - at) / 0.15);
    const x = left + 20 + h(i + 50) * (w - 40), y = top + 30 + h(i + 90) * (bottom - top - 120), r = (6 + h(i + 130) * 14) * k;
    ctx.fillStyle = BROWN[i % BROWN.length];
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.6 + h(i + 7) * 0.4), h(i + 3) * 3, 0, Math.PI * 2); ctx.fill();
    for (let s = 0; s < 4; s++) { const a = h(i * 5 + s) * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 1.2, 1 + h(i + s) * 2, 0, Math.PI * 2); ctx.fill(); }
    const run = (8 + h(i + 170) * 50) * k * Math.min(1, f * 1.4);
    ctx.fillRect(x - 1.5, y, 3, run); ctx.beginPath(); ctx.ellipse(x, y + run, 2.2, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // The sludge along the deck: a layer of it building up, lumpy, logs in it
  const depth = 2 + f * 12;
  ctx.fillStyle = '#4A2F12';
  ctx.beginPath(); ctx.moveTo(left, bottom);
  for (let x = left; x <= right; x += 12) ctx.lineTo(x, bottom - 14 - depth + Math.sin(x * 0.07 + 1.3) * 2 * f - h(Math.floor(x / 12)) * 3 * f);
  ctx.lineTo(right, bottom); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(150, 110, 50, 0.4)'; for (let x = left + 6; x < right; x += 23) ctx.fillRect(x, bottom - 14 - depth + 1, 6, 1.5);
  for (let i = 0; i < 26; i++) {
    const at = h(i + 300) * 0.9;
    if (f < at) continue;
    const x = left + 30 + h(i + 320) * (w - 60), y = bottom - 14 - depth + 2;
    ctx.save(); ctx.translate(x, y); ctx.rotate((h(i + 340) - 0.5) * 0.8);
    ctx.fillStyle = BROWN[(i + 1) % BROWN.length]; ctx.beginPath(); ctx.roundRect(-11, -5, 22, 9, 4); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-4, -5, 1.5, 9); ctx.fillRect(4, -5, 1.5, 9);
    ctx.restore();
  }
  // A brown haze over the whole room
  ctx.fillStyle = `rgba(92, 64, 24, ${0.28 * f})`; ctx.fillRect(left, top, w, bottom - top);
  // Stink coming up off the deck
  if (f > 0.3) {
    ctx.strokeStyle = `rgba(132, 160, 60, ${0.5 * (f - 0.3) / 0.7})`; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const x = left + 40 + h(i + 400) * (w - 80), t = ((frame * 0.6 + i * 37) % 90) / 90;
      const y0 = bottom - 20 - depth - t * 120;
      ctx.globalAlpha = 1 - t;
      ctx.beginPath(); ctx.moveTo(x, y0); for (let k = 1; k <= 6; k++) ctx.lineTo(x + Math.sin(k * 1.4 + frame * 0.1) * 5, y0 - k * 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // Flies, over the worst of it
  ctx.fillStyle = '#0B0B0B';
  const flies = Math.floor(f * 28);
  for (let i = 0; i < flies; i++) {
    const cx = left + 40 + h(i + 500) * (w - 80), cy = bottom - 40 - h(i + 520) * 60;
    const a = frame * (0.18 + h(i + 540) * 0.2) + i;
    ctx.fillRect(cx + Math.cos(a) * 14 + Math.sin(a * 2.3) * 4, cy + Math.sin(a * 1.7) * 9, 2, 2);
  }
  // The telemetry on the glass: something to say about the air
  if (f > 0.4) {
    ctx.fillStyle = Math.floor(frame / 20) % 2 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(253, 224, 71, 0.9)';
    ctx.font = '7px monospace';
    ctx.fillText(f > 0.85 ? 'AIR QUALITY: BIOHAZARD // DO NOT BREATHE' : 'AIR QUALITY: HAZARDOUS // FECAL PARTICULATE DETECTED', left + 40, top + 64);
  }
  ctx.restore();
};
