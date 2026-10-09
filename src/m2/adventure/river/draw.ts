// The river, drawn (crude, the first pass: boxes, shapes and words). Behind: the sky, the far bank and its fake
// animals, the water's depths, the cave, the rides on the bed, the animatronic dinosaurs, the tank's gallery behind
// its glass, the boat and Artie, the rock. In front: the water over everything in it, the bubbles, what's said, his air.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, label, saidOver } from '../section';
import { SECTIONS, GY } from '../geometry';
import { drawGuestsDimmed } from '../queue/crowd';
import { drawSafariArtie, ARTIE_H } from './artie';
import type { River } from './index';
import { WS, CEIL, DOCK, BOAT, FALLS, TUNNEL, POCKETS, POCKET_TOP, TANK, PIPE, BED, bedAt, roofAt, PROPS, DINOS, GALLERY, VENTS } from './course';

type Ctx = CanvasRenderingContext2D;
const { x0, x1 } = SECTIONS.river;
const R = (x: number) => x0 + x;
const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;

export const drawRiverBackdrop = (c: Ctx, state: GameState) => {
  const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#7DD3FC'); g.addColorStop(1, '#BEF264');
  c.fillStyle = g; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // (far jungle hills, slow)
  const cy = -state.camera.y;
  c.fillStyle = '#166534';
  for (let i = -1; i < 10; i++) {
    const x = i * 120 - ((state.camera.x * 0.2) % 120);
    c.beginPath(); c.arc(x, cy + GY - 120, 90, Math.PI, 0); c.fill();
  }
  c.fillStyle = '#14532D'; c.fillRect(0, cy + GY - 120, CANVAS_WIDTH, CANVAS_HEIGHT + 2000);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------

/** The far bank's show: fake animals for the tour. */
const drawBankShow = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // (the bank itself, behind the water: trees)
  box(c, R(DOCK), WS - 70, FALLS.x - DOCK, 70, '#3F6212');
  for (let x = DOCK; x < FALLS.x; x += 90) { box(c, R(x + 30), WS - 190, 12, 130, '#713F12'); c.fillStyle = '#15803D'; c.beginPath(); c.arc(R(x + 36), WS - 200, 46, 0, Math.PI * 2); c.fill(); }
  // The elephant (spraying)
  const ex = R(2050);
  box(c, ex - 50, WS - 110, 100, 60, '#9CA3AF'); box(c, ex + 40, WS - 130, 40, 40, '#9CA3AF');
  for (const lx of [-40, -10, 20, 38]) box(c, ex + lx, WS - 55, 14, 40, '#6B7280');
  c.strokeStyle = '#9CA3AF'; c.lineWidth = 9; c.beginPath(); c.moveTo(ex + 76, WS - 100); c.quadraticCurveTo(ex + 110, WS - 160 + Math.sin(f * 0.05) * 20, ex + 90, WS - 180); c.stroke();
  if (f % 120 < 60) for (let k = 0; k < 6; k++) box(c, ex + 90 + k * 10, WS - 190 + k * k * 3, 4, 4, '#BAE6FD');
  box(c, ex + 64, WS - 120, 4, 4, '#000');
  // The hippo (bobbing, on a rod: you can see the rod)
  const hx = R(2380), hy = WS - 20 + Math.sin(f * 0.04) * 6;
  box(c, hx - 3, hy, 6, 40, '#57534E');
  box(c, hx - 40, hy - 30, 80, 34, '#A78BFA'); box(c, hx + 22, hy - 30 - (f % 90 < 20 ? 14 : 0), 34, 18, '#8B5CF6');
  box(c, hx - 30, hy - 38, 8, 8, '#A78BFA'); box(c, hx - 4, hy - 38, 8, 8, '#A78BFA');
  // The gorillas (it's Dave)
  for (let i = 0; i < 3; i++) {
    const gx = R(2640 + i * 70), gy = WS - 70 + (i === 1 ? -8 : 0);
    box(c, gx - 18, gy - 60, 36, 50, '#292524'); box(c, gx - 10, gy - 78, 20, 20, '#292524'); box(c, gx - 6, gy - 72, 12, 10, '#78716C');
    box(c, gx - 26, gy - 56 + ((f >> 4) + i) % 2 * 6, 8, 34, '#292524'); box(c, gx + 18, gy - 56, 8, 34, '#292524');
    // (the zipper up the back of the costume)
    box(c, gx - 1, gy - 60, 2, 40, '#A8A29E');
  }
  label(c, 'DAVE', R(2710), WS - 160, '#FDE68A', 6);
  // Gerald (a rock)
  box(c, R(3200), WS - 60, 90, 50, '#57534E');
  label(c, 'GERALD', R(3245), WS - 70, '#E7E5E4', 5);
};

/** A sunk ride (solid), on the bed. */
const drawProp = (c: Ctx, p: (typeof PROPS)[number]) => {
  const x = R(p.x), y = bedAt(p.x + p.w / 2) - p.h, lip = (col: string) => box(c, x, y, p.w, 3, col);
  if (p.look === 'rock') { box(c, x, y, p.w, p.h + 30, '#44403C'); lip('#78716C'); box(c, x + 10, y + 20, 20, 12, '#292524'); }
  else if (p.look === 'boat') {
    box(c, x, y + 10, p.w, p.h + 20, '#7C2D12'); lip('#FDBA74'); box(c, x, y, p.w, 10, '#9A3412');
    for (let k = 0; k < 4; k++) { c.fillStyle = '#1C1917'; c.beginPath(); c.arc(x + 40 + k * 60, y + 30, 8, 0, Math.PI * 2); c.fill(); }
    label(c, 'JUNGLE CRUISE  BOAT 3', x + p.w / 2, y + 52, '#FDE68A', 5);
  } else if (p.look === 'teacup') {
    box(c, x, y, p.w, p.h, '#F9A8D4'); lip('#FDF2F8'); box(c, x + p.w, y + 10, 10, 20, '#F9A8D4');
    for (let k = 8; k < p.w; k += 16) box(c, x + k, y + 16, 6, 6, '#BE185D');
  } else if (p.look === 'log') { box(c, x, y, p.w, p.h, '#92400E'); lip('#FCD34D'); label(c, 'SPLASH!', x + p.w / 2, y + 22, '#FEF3C7', 6); }
  else if (p.look === 'booth') {
    box(c, x, y, p.w, p.h + 20, '#0E7490'); lip('#67E8F9'); box(c, x + 15, y + 25, p.w - 30, 30, '#164E63');
    label(c, 'TICKETS', x + p.w / 2, y + 16, '#FDE047', 5);
  }
};

/** An animatronic dinosaur on the bed (harmless, dimmed: scenery; one's still got its price tag on). */
const drawDino = (c: Ctx, d: (typeof DINOS)[number], f: number) => {
  const x = R(d.x), y = bedAt(d.x), nod = Math.sin(f * 0.04 + d.x) * 6;
  c.save(); c.globalAlpha = 0.75;
  const col = d.look === 'rex' ? '#4D7C0F' : d.look === 'stego' ? '#65A30D' : d.look === 'trike' ? '#A16207' : '#0F766E';
  if (d.look === 'rex') {
    box(c, x - 50, y - 120, 100, 60, col); box(c, x + 30, y - 190 + nod, 70, 50, col); box(c, x + 50, y - 150 + nod, 50, 12, '#F8FAFC');
    box(c, x - 40, y - 60, 22, 60, col); box(c, x + 10, y - 60, 22, 60, col); box(c, x - 120, y - 110, 70, 20, col);
    box(c, x + 70, y - 180 + nod, 8, 8, '#FDE047');
    label(c, '$49.99', x - 30, y - 90, '#F8FAFC', 6); box(c, x - 52, y - 100, 44, 2, '#F8FAFC');
  } else if (d.look === 'stego') {
    box(c, x - 70, y - 80, 140, 50, col); for (let k = -50; k < 60; k += 24) box(c, x + k, y - 106, 14, 26, '#B45309');
    box(c, x + 70, y - 70 + nod, 36, 24, col); box(c, x - 60, y - 30, 20, 30, col); box(c, x + 40, y - 30, 20, 30, col);
  } else if (d.look === 'trike') {
    box(c, x - 60, y - 70, 120, 50, col); box(c, x + 50, y - 90 + nod, 40, 40, '#D97706'); box(c, x + 90, y - 74 + nod, 26, 6, '#F8FAFC'); box(c, x + 84, y - 98 + nod, 26, 5, '#F8FAFC');
    box(c, x - 50, y - 20, 20, 20, col); box(c, x + 30, y - 20, 20, 20, col);
  } else {
    box(c, x - 70, y - 90, 140, 60, col); box(c, x + 50, y - 260, 24, 180, col); box(c, x + 50, y - 270 + nod, 50, 24, col);
    box(c, x - 60, y - 30, 22, 30, col); box(c, x + 40, y - 30, 22, 30, col);
    // (its neck's come off its mount: wires)
    c.strokeStyle = '#EF4444'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 60, y - 260); c.lineTo(x + 40, y - 280); c.stroke();
  }
  c.restore();
};

/** The tank's back: the gallery behind its glass (the guests in the dark), the frames, the plesiosaur on its track. */
const drawTank = (c: Ctx, state: GameState, rv: River) => {
  const f = state.frame;
  // (above the water: the exhibit hall, its sign)
  box(c, R(TANK.x1), WS - 420, TANK.x2 - TANK.x1, 420, '#1E3A8A');
  label(c, 'SEA MONSTERS OF THE MESOZOIC', R((TANK.x1 + TANK.x2) / 2), WS - 300, '#FDE047', 12);
  label(c, 'PLEASE DO NOT TAP ON THE GLASS', R((TANK.x1 + TANK.x2) / 2), WS - 270, '#BFDBFE', 7);
  // The gallery behind the glass
  box(c, R(GALLERY.x1), GALLERY.glassTop, GALLERY.x2 - GALLERY.x1, GALLERY.floor - GALLERY.glassTop + 20, '#0B1120');
  drawGuestsDimmed(c, rv.guests, f, 0.32, '40, 50, 60');
  c.fillStyle = 'rgba(125, 211, 252, 0.18)'; c.fillRect(R(GALLERY.x1), GALLERY.glassTop, GALLERY.x2 - GALLERY.x1, GALLERY.floor - GALLERY.glassTop);
  for (let x = GALLERY.x1; x <= GALLERY.x2; x += 280) box(c, R(x) - 4, GALLERY.glassTop, 8, GALLERY.floor - GALLERY.glassTop + 20, '#334155');
  box(c, R(GALLERY.x1), GALLERY.glassTop - 6, GALLERY.x2 - GALLERY.x1, 8, '#334155');
  // (glints on the glass)
  c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 3;
  for (let x = GALLERY.x1 + 60; x < GALLERY.x2; x += 280) { c.beginPath(); c.moveTo(R(x), GALLERY.glassTop + 30); c.lineTo(R(x + 40), GALLERY.glassTop + 90); c.stroke(); }
  // The plesiosaur, on its track (harmless; the track's showing)
  const t = (Math.sin(f * 0.004) + 1) / 2, px = R(TANK.x1 + 300 + t * (TANK.x2 - TANK.x1 - 700)), py = WS + 170, dir = Math.cos(f * 0.004) > 0 ? 1 : -1;
  box(c, R(TANK.x1 + 200), py + 50, TANK.x2 - TANK.x1 - 400, 6, '#475569');
  box(c, px - 3, py + 20, 6, 32, '#475569');
  c.save(); c.globalAlpha = 0.85; c.translate(px, py); c.scale(dir, 1);
  c.fillStyle = '#0D9488'; c.beginPath(); c.ellipse(0, 0, 70, 26, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#0D9488'; c.lineWidth = 14; c.beginPath(); c.moveTo(50, -10); c.quadraticCurveTo(110, -60, 130 + Math.sin(f * 0.03) * 8, -110); c.stroke();
  c.fillStyle = '#0D9488'; c.beginPath(); c.ellipse(138, -114, 20, 11, 0, 0, Math.PI * 2); c.fill();
  box(c, 146, -118, 4, 4, '#FDE047');
  for (const s of [-1, 1]) { c.fillStyle = '#115E59'; c.beginPath(); c.ellipse(s * 34, 20, 26, 8, s * 0.5 + Math.sin(f * 0.05) * 0.3, 0, Math.PI * 2); c.fill(); }
  c.restore();
};

/** The boat, and Artie in it. */
const drawBoat = (c: Ctx, state: GameState, rv: River) => {
  const b = rv.boat, x = b.x, d = BOAT.deck, f = state.frame;
  // (the hull, the stripes of its canopy up on poles: not a platform, so it's thin and dim)
  c.fillStyle = '#B45309'; c.beginPath(); c.moveTo(x - 10, d); c.lineTo(x + BOAT.w + 16, d); c.lineTo(x + BOAT.w - 10, WS + 18); c.lineTo(x + 10, WS + 18); c.closePath(); c.fill();
  box(c, x - 10, d, BOAT.w + 26, 3, '#FDE68A');
  box(c, x + 10, d + 6, BOAT.w - 20, 5, '#F8FAFC');
  label(c, 'BOAT 7', x + BOAT.w / 2, d + 26, '#FEF3C7', 6);
  for (const px of [6, BOAT.w - 10]) box(c, x + px, d - 120, 4, 120, '#A8A29E');
  for (let k = 0; k < BOAT.w; k += 24) box(c, x + k, d - 126, 12, 10, '#DC2626');
  for (let k = 12; k < BOAT.w; k += 24) box(c, x + k, d - 126, 12, 10, '#F8FAFC');
  // (the engine at the back, coughing when it's dry)
  box(c, x - 26, d - 14, 22, 26, '#3F3F46');
  if (b.smoke > 0 && f % 6 === 0) state.particles.push({ pos: { x: x - 16, y: d - 20 }, vel: { x: -0.5, y: -1 }, life: 40, color: '#52525B', size: 6 });
  // Artie
  const ax = x + 200, p = state.player;
  const facing = p.pos.x + p.width / 2 < ax ? -1 : 1;
  const pose = rv.artieRadio ? 'radio' : b.phase === 'jumped' && rv.artieSaid ? 'angry' : rv.artieSaid ? (b.phase === 'ride' && b.tour > 0 ? 'point' : 'talk') : 'stand';
  drawSafariArtie(c, ax, d, pose === 'point' ? 1 : facing, f, pose);
};

/** The rock: the backside of water, the tunnel's roof and its pocket hollows, the tank's wall, the pipe, the bed. */
const drawRock = (c: Ctx) => {
  const ROCK = '#44403C', DARK = '#292524', LIP = '#78716C';
  const roof = (a: number, b: number, bottom: number) => { box(c, R(a), bottom - 600, b - a, 600, ROCK); box(c, R(a), bottom - 6, b - a, 6, DARK); };
  roof(FALLS.x, FALLS.x + FALLS.w, FALLS.bottom);
  box(c, R(FALLS.x), FALLS.bottom - 1200, FALLS.w, 700, ROCK);
  let x = TUNNEL.x1;
  for (const p of POCKETS) { roof(x, p.x, CEIL); roof(p.x, p.x + p.w, POCKET_TOP); box(c, R(p.x), POCKET_TOP, p.w, WS - POCKET_TOP, '#1C1917'); box(c, R(p.x + 20), POCKET_TOP + 20, p.w - 40, 6, '#57534E'); x = p.x + p.w; }
  roof(x, TUNNEL.x2, CEIL);
  // (the rock up over the tunnel: the ground up top, and the jungle on it)
  box(c, R(TUNNEL.x1), CEIL - 1600, TUNNEL.x2 - TUNNEL.x1, 1000, ROCK);
  roof(TANK.x2, PIPE.x2, PIPE.top);
  box(c, R(TANK.x2), PIPE.top - 1600, PIPE.x2 - TANK.x2, 1000, ROCK);
  box(c, R(PIPE.x2), 0, 200, 1600, ROCK);
  // The pipe: concrete, the grate at its end burst open
  box(c, R(PIPE.x1), PIPE.top, PIPE.x2 - PIPE.x1, 100, '#1E293B');
  label(c, 'STORM DRAIN INTAKE  KEEP CLEAR', R(TANK.x2 - 160), PIPE.top - 40, '#FDE047', 6);
  box(c, R(PIPE.x2 - 40), PIPE.top, 40, 100, '#020617');
  // The bed (lit along the top where it's stood on)
  c.fillStyle = '#57534E'; c.beginPath(); c.moveTo(R(BED[0][0]), BED[0][1]);
  for (const [bx, by] of BED) c.lineTo(R(bx), by);
  c.lineTo(R(BED[BED.length - 1][0]), 1700); c.lineTo(R(BED[0][0]), 1700); c.closePath(); c.fill();
  c.strokeStyle = LIP; c.lineWidth = 3; c.beginPath(); BED.forEach(([bx, by], i) => (i ? c.lineTo(R(bx), by) : c.moveTo(R(bx), by))); c.stroke();
};

export const drawRiverBack = (c: Ctx, state: GameState, rv: River) => {
  if (!seen(state, x0 - 200, x1)) return;
  const f = state.frame;
  // The dock
  box(c, x0, GY, DOCK, 1200, '#57534E'); box(c, x0, GY - 8, DOCK, 10, '#92400E'); box(c, x0, GY - 8, DOCK, 3, '#FCD34D');
  for (let x = 20; x < DOCK; x += 70) box(c, x0 + x, GY + 2, 10, WS + 200 - GY, '#78350F');
  label(c, 'JUNGLE CRUISE', R(190), GY - 140, '#FEF3C7', 10);
  // The deep water, behind everything in it (darker the deeper; a cave in the tunnel)
  const g = c.createLinearGradient(0, WS, 0, 1040);
  g.addColorStop(0, '#0E7490'); g.addColorStop(1, '#082F49');
  c.fillStyle = g; c.fillRect(R(DOCK), WS, PIPE.x2 - DOCK, 1040 - WS);
  box(c, R(TUNNEL.x1), CEIL, TUNNEL.x2 - TUNNEL.x1, 420, 'rgba(2, 6, 23, 0.35)');
  if (seen(state, R(DOCK), R(FALLS.x + 200))) drawBankShow(c, state);
  // The rides graveyard's junk that isn't solid: a carousel horse on its pole, a sign
  if (seen(state, R(6600), R(7300))) {
    box(c, R(6800), CEIL, 6, bedAt(6800) - CEIL, '#D4D4D8');
    c.save(); c.globalAlpha = 0.75;
    box(c, R(6770), 850, 70, 30, '#F8FAFC'); box(c, R(6830), 830, 20, 30, '#F8FAFC'); box(c, R(6775), 880, 8, 26, '#F8FAFC'); box(c, R(6825), 880, 8, 26, '#F8FAFC');
    box(c, R(6800), 852, 30, 8, '#F472B6');
    c.restore();
    box(c, R(7040), 820, 130, 40, '#78716C'); label(c, 'CLOSED FOR', R(7105), 836, '#FDE68A', 5); label(c, 'REFURBISHMENT 1994', R(7105), 850, '#FDE68A', 5);
    box(c, R(7100), 860, 6, bedAt(7100) - 860, '#57534E');
  }
  for (const d of DINOS) if (seen(state, R(d.x - 160), R(d.x + 160))) drawDino(c, d, f);
  if (seen(state, R(TANK.x1), R(TANK.x2))) drawTank(c, state, rv);
  drawRock(c);
  for (const p of PROPS) if (seen(state, R(p.x), R(p.x + p.w))) drawProp(c, p);
  // (the eels' holes)
  for (const e of state.enemies) if (e.kind === 'm2:eel' && seen(state, e.homeX ?? 0, (e.homeX ?? 0) + 1)) { c.fillStyle = '#0C0A09'; c.beginPath(); c.ellipse(e.homeX ?? 0, (e.homeY ?? 0) - 8, 10, 14, 0, 0, Math.PI * 2); c.fill(); }
  // (the vents)
  for (const v of VENTS) if (seen(state, R(v - 20), R(v + 20))) { box(c, R(v) - 10, bedAt(v) - 8, 20, 8, '#1C1917'); box(c, R(v) - 6, bedAt(v) - 10, 12, 3, '#57534E'); }
  if (rv.boat.block && seen(state, rv.boat.x - 40, rv.boat.x + BOAT.w + 40)) drawBoat(c, state, rv);
};

export const drawRiverFront = (c: Ctx, state: GameState, rv: River) => {
  if (!seen(state, x0 - 200, x1)) return;
  const f = state.frame, p = state.player;
  // The water over everything in it: a tint, the surface's lit line (wavy), the falls coming down in front of the rock
  c.fillStyle = 'rgba(14, 116, 144, 0.16)'; c.fillRect(R(DOCK), WS, PIPE.x2 - DOCK, 1040 - WS);
  c.fillStyle = 'rgba(186, 230, 253, 0.8)';
  const a = Math.max(R(DOCK), state.camera.x - 20), b = Math.min(R(PIPE.x2), state.camera.x + CANVAS_WIDTH + 20);
  for (let x = a - (a % 16); x < b; x += 16) if (roofAt(x - x0) <= WS) c.fillRect(x, WS - 2 + Math.sin(x * 0.05 + f * 0.08) * 1.5, 10, 2);
  if (seen(state, R(FALLS.x - 40), R(FALLS.x + 80))) {
    c.fillStyle = 'rgba(224, 242, 254, 0.75)';
    for (let k = 0; k < 7; k++) c.fillRect(R(FALLS.x - 30 + k * 6), 0, 4, WS + 4);
    for (let k = 0; k < 8; k++) { const y = (f * 4 + k * 70) % (WS + 10); c.fillStyle = '#F8FAFC'; c.fillRect(R(FALLS.x - 30 + (k * 13) % 40), y, 3, 14); }
    label(c, 'THE BACKSIDE OF WATER', R(FALLS.x + 35), WS - 260, '#F8FAFC', 7);
  }
  // The bubbles
  c.strokeStyle = 'rgba(224, 242, 254, 0.9)'; c.lineWidth = 1.5;
  for (const bb of rv.bubbles) { c.beginPath(); c.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(bb.x - bb.r * 0.4, bb.y - bb.r * 0.5, 2, 2); }
  // What's said: Artie (and the radio's static after a call), the guests behind the glass
  if (rv.boat.block) {
    const ax = rv.boat.x + 200, ay = BOAT.deck - ARTIE_H - 8;
    if (rv.artieSaid) saidOver(c, rv.artieSaid, ax, ay, '#FDE68A');
    else if (rv.static > 0) label(c, '*KSSSHHHHH*', ax + 10, ay + 20, '#A8A29E', 6);
  }
  for (const g of rv.guests) if (g.said) saidOver(c, g.said, g.x, GALLERY.glassTop + 30, '#BFDBFE');
  // His air, over his head (while it's not full)
  if (rv.o2 < 0.999 && p.health > 0 && !p.hidden) {
    const n = 6, lit = Math.ceil(rv.o2 * n), cx = p.pos.x + p.width / 2, y = p.pos.y - 18;
    for (let i = 0; i < n; i++) {
      const bx = cx - (n - 1) * 6 + i * 12;
      c.beginPath(); c.arc(bx, y, 4.5, 0, Math.PI * 2);
      if (i < lit) { c.fillStyle = rv.o2 < 0.3 && f % 20 < 10 ? '#F87171' : '#E0F2FE'; c.fill(); }
      c.strokeStyle = '#0C4A6E'; c.lineWidth = 1.5; c.stroke();
    }
  }
};
