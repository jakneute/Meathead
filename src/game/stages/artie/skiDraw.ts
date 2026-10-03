// The ski run's pieces: the skier, his skis, the obstacles, the avalanche,
// Meathead rolled up in a snowball, the ranger cabin and the snow pile.

import { drawPerson } from '../../render/npc/person';
import { RANGER_RADIO, RANGER_RADIO_EVERY, radioLive } from './ski';
import { bandedGradient } from '../../render/pixelArt';
import type { GameState } from '../../core/state';
import { groundLineAt } from '../../core/terrain';
import { GROUND_Y } from '../../../constants';
import { COURSE } from './course';
import type { Ski } from './ski';
import { sentenceShown } from '../../platform/speech';

import { viewOf, pixEllipse, snowDisc, logAlong, iceSpike, pineTier, snowCap, slab, letter, shingles } from './draw';
import { INK, shaded, shadedTop, ink, limb } from '../../render/npc/kit';
import { pixelBlob, checker } from '../../render/pixelArt';

type Ctx = CanvasRenderingContext2D;

const visible = (state: GameState, x1: number, x2: number) => { const v = viewOf(state); return x2 > v.x - 80 && x1 < v.x + v.w + 80; };
const groundAt = (state: GameState, x: number) => { const g = groundLineAt(state.groundRuns, x); return g === Infinity ? viewOf(state).y + viewOf(state).h : g; };
/** The ground under the avalanche: across a crevasse it just rolls straight over (the line from one lip to the other). */
const snowLineAt = (state: GameState, x: number) => {
  const g = groundLineAt(state.groundRuns, x);
  if (g !== Infinity) return g;
  let l = x, r = x, gl = Infinity, gr = Infinity;
  for (let d = 8; d < 800 && (gl === Infinity || gr === Infinity); d += 8) {
    if (gl === Infinity) { gl = groundLineAt(state.groundRuns, x - d); l = x - d; }
    if (gr === Infinity) { gr = groundLineAt(state.groundRuns, x + d); r = x + d; }
  }
  if (gl === Infinity) return gr === Infinity ? viewOf(state).y + viewOf(state).h : gr;
  if (gr === Infinity) return gl;
  return gl + ((x - l) / (r - l)) * (gr - gl);
};

// ---------------------------------------------------------------------------
// Behind Meathead: obstacles, the skier, the cabin, the pile
// ---------------------------------------------------------------------------

export const drawSkiMid = (ctx: Ctx, state: GameState, ski: Ski) => {
  COURSE.ski.obstacles.forEach((o, i) => { if (!ski.broken[i] && visible(state, o.x - 60, o.x + 60)) drawObstacle(ctx, o.kind, o.x, o.ground, state.frame); });
  drawSkier(ctx, state, ski);
  drawCabin(ctx, state, ski);
};

/** The part of a big tree that'll take your head off: a thick limb across the run at head height. */
const drawLimb = (ctx: Ctx, x: number, g: number, frame: number) => {
  const tx = x + 58, sway = Math.sin(frame * 0.05) * 1.5;
  // Limb, outlined heavy so it stands out from the faded tree behind it: bark in steps (lit along the top, dark
  // under), furrows along it
  const limbPath = () => { ctx.beginPath(); ctx.moveTo(tx + 6, g - 108); ctx.lineTo(x - 50, g - 94 + sway); ctx.lineTo(x - 50, g - 78 + sway); ctx.lineTo(tx + 6, g - 88); ctx.closePath(); };
  ctx.fillStyle = '#5B3A1E'; limbPath(); ctx.fill();
  ctx.save(); limbPath(); ctx.clip();
  const along = (k: number, c: string, w: number) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(tx + 6, g - 108 + (20 * k)); ctx.lineTo(x - 50, g - 94 + sway + 16 * k); ctx.stroke(); };
  along(0.12, '#7E5430', 5); along(0.05, '#9A6A40', 2); along(0.9, '#3A240F', 6); along(0.5, '#3F2A15', 1);
  ctx.restore();
  ctx.strokeStyle = '#140C06'; ctx.lineWidth = 3; limbPath(); ctx.stroke();
  // A knot and a broken-off twig
  ink(ctx, () => ctx.ellipse(x + 10, g - 92, 5, 3, 0, 0, Math.PI * 2), '#3F2A1D');
  ctx.fillStyle = '#21140A'; ctx.fillRect(x + 9, g - 93, 3, 2);
  limb(ctx, x - 20, g - 92 + sway, x - 30, g - 110 + sway, 3, '#4A301A');
  // Snow along the top, icicles hanging off it, a few clumps of needles
  ctx.fillStyle = '#9FB4D2'; ctx.fillRect(x - 48, g - 95 + sway, 104, 2);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 48, g - 100 + sway, 104, 5);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 44, g - 100 + sway, 90, 1);
  ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 1; ctx.strokeRect(x - 48.5, g - 100.5 + sway, 105, 6);
  for (let k = 0; k < 6; k++) iceSpike(ctx, x - 42 + k * 17, g - 80 + sway, 6, 12 + (k % 2) * 4);
  for (let k = 0; k < 3; k++) {
    const nx = x - 36 + k * 34, tuft = () => { ctx.beginPath(); ctx.moveTo(nx, g - 84 + sway); ctx.lineTo(nx + 9, g - 64 + sway); ctx.lineTo(nx + 18, g - 84 + sway); ctx.closePath(); };
    ctx.fillStyle = '#166534'; tuft(); ctx.fill();
    ctx.fillStyle = '#2E8A4E'; ctx.beginPath(); ctx.moveTo(nx, g - 84 + sway); ctx.lineTo(nx + 9, g - 64 + sway); ctx.lineTo(nx + 8, g - 84 + sway); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; tuft(); ctx.stroke();
  }
};

const drawObstacle = (ctx: Ctx, kind: string, x: number, g: number, frame: number) => {
  switch (kind) {
    case 'rock': {
      // (granite in three facets, lit from the upper left, a crack, inked; snow lying on it)
      const rock = () => { ctx.beginPath(); ctx.moveTo(x - 24, g); ctx.lineTo(x - 18, g - 22); ctx.lineTo(x - 2, g - 32); ctx.lineTo(x + 16, g - 26); ctx.lineTo(x + 24, g); ctx.closePath(); };
      ctx.fillStyle = '#57534E'; rock(); ctx.fill();
      ctx.fillStyle = '#3A3734'; ctx.beginPath(); ctx.moveTo(x + 4, g - 16); ctx.lineTo(x + 16, g - 26); ctx.lineTo(x + 24, g); ctx.lineTo(x + 2, g); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.moveTo(x - 16, g - 20); ctx.lineTo(x - 2, g - 30); ctx.lineTo(x + 4, g - 16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - 12, g - 22, 6, 2); ctx.fillRect(x - 6, g - 26, 4, 2);
      ctx.strokeStyle = '#292524'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 10, g - 4); ctx.lineTo(x - 6, g - 12); ctx.lineTo(x - 8, g - 16); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; rock(); ctx.stroke();
      ctx.fillStyle = '#A9BEDA'; ctx.beginPath(); ctx.ellipse(x - 2, g - 29, 14, 4, -0.1, 0, Math.PI * 2); ctx.fill();
      ink(ctx, () => ctx.ellipse(x - 2, g - 31, 14, 4, -0.1, Math.PI, 0), '#F8FAFC');
      pixEllipse(ctx, x, g, 26, 3, 'rgba(59, 78, 110, 0.35)');
      break;
    }
    case 'log':
      logAlong(ctx, x - 34, x + 34, g - 12, 20);
      snowCap(ctx, x - 30, x + 20, g - 26, 4);
      break;
    case 'pine':
      ctx.fillStyle = '#3F2A1D'; ctx.fillRect(x - 3, g - 14, 6, 14);
      ctx.fillStyle = '#5E4030'; ctx.fillRect(x - 3, g - 14, 2, 14);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 3.5, g - 14, 7, 14);
      for (let k = 0; k < 3; k++) {
        const top = g - 76 + k * 18, half = 10 + k * 6;
        pineTier(ctx, x, top, top + 26, half, { shade: '#14532D', lit: '#22803F', ink: INK });
      }
      pixEllipse(ctx, x, g, 14, 4, '#F1F5F9', true);
      break;
    case 'branch': {
      // A big tree back off the run: faded into the haze, so it reads as scenery (its limb, in front, is what hits you)
      const tx = x + 58;
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#334155'; ctx.fillRect(tx - 7, g - 230, 14, 222);
      ctx.fillStyle = '#475569'; ctx.fillRect(tx - 7, g - 230, 4, 222);
      ctx.fillStyle = '#1E293B'; ctx.fillRect(tx + 3, g - 230, 4, 222);
      for (let k = 0; k < 3; k++) { const top = g - 320 + k * 55, half = 34 + k * 14; pineTier(ctx, tx, top, top + 80, half, { shade: '#1E3A4A', lit: '#2C4E60', ink: '#13222E' }); }
      ctx.restore();
      // Its roots are set back up the bank, not on the run: a soft shadow where it stands
      pixEllipse(ctx, tx, g - 8, 22, 4, 'rgba(71, 85, 105, 0.25)');
      break;
    }
  }
};

/** A 90s neon ski bro, admiring the view. Then not. */
const drawSkier = (ctx: Ctx, state: GameState, ski: Ski) => {
  const sk = ski.skier;
  if (sk.state === 'gone' || !visible(state, sk.x - 60, sk.x + 60)) { drawSkis(ctx, state, ski); return; }
  ctx.save();
  ctx.translate(sk.x, sk.y);
  if (sk.state === 'flying') { ctx.translate(0, -30); ctx.rotate(sk.rot); ctx.translate(0, 30); }
  // Skis (still on him until he's kicked)
  if (sk.state === 'stand') { skiPlank(ctx, -26, 30, -3, 4); }
  // Him: the neon one-piece (pink, the teal and lime stripes), a bleached mullet out the back of the white helmet, the
  // mirrored goggles, his poles
  const pole = (c: Ctx, hx: number, hy: number) => { c.strokeStyle = '#1A0B06'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(hx, hy - 3); c.lineTo(hx + 8, -1); c.stroke(); c.strokeStyle = '#CBD5E1'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx, hy - 3); c.lineTo(hx + 8, -1); c.stroke(); c.fillStyle = '#1A0B06'; c.fillRect(hx + 5, -5, 6, 1.4); };
  drawPerson(ctx, 0, sk.state === 'stand' ? -3 : 0, {
    skin: '#E8B495', hair: { style: 'mullet', color: '#FDE047' }, top: { style: 'parka', color: '#EC4899', accent: '#22D3EE' }, legs: { color: '#EC4899' }, shoes: '#111827',
    hat: { style: 'helmet', color: '#F8FAFC' }, eyes: 'goggles',
    extra: c => { c.fillStyle = '#A3E635'; c.fillRect(-9, -36, 18, 2); },
  }, { arms: 'hold', mouth: sk.state === 'flying' ? 'open' : 'grin', f: state.frame, prop: pole, propBack: pole });
  ctx.restore();
  // What he's saying
  if (sk.lineT > 0 && sk.line) {
    const line = sentenceShown(sk.line);
    ctx.save();
    ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
    const w = ctx.measureText(line).width + 14;
    const bx = sk.x, by = sk.y - 96;
    // (an inked bubble, its tail down to him)
    const bubble = () => { ctx.beginPath(); ctx.rect(bx - w / 2, by - 14, w, 22); ctx.moveTo(bx - 6, by + 8); ctx.lineTo(bx, by + 16); ctx.lineTo(bx + 4, by + 8); };
    ctx.strokeStyle = INK; ctx.lineWidth = 2; bubble(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; bubble(); ctx.fill();
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(bx - w / 2, by + 6, w, 2);
    ctx.fillStyle = '#111'; ctx.fillText(line, bx, by + 2);
    ctx.restore();
  }
  drawSkis(ctx, state, ski);
};

/** The stolen skis, spinning through the air on their way to Meathead's feet. */
const drawSkis = (ctx: Ctx, _state: GameState, ski: Ski) => {
  const s = ski.skis;
  if (!s) return;
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
  skiPlank(ctx, -28, 28, -4, 4); skiPlank(ctx, -28, 28, 2, 4);
  ctx.restore();
};

/** A ski from x0 to x1 (tip at x1, turned up), its top at y, h thick: yellow, lit along the top, a stripe down it, the
 * edge in shadow, inked. */
const skiPlank = (ctx: Ctx, x0: number, x1: number, y: number, h: number) => {
  const path = () => { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1 - 2, y); ctx.quadraticCurveTo(x1 + 4, y - 1, x1 + 4, y - 4); ctx.lineTo(x1 + 6, y - 3); ctx.quadraticCurveTo(x1 + 6, y + h, x1 - 2, y + h); ctx.lineTo(x0, y + h); ctx.closePath(); };
  ctx.fillStyle = '#FACC15'; path(); ctx.fill();
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(x0, y, x1 - x0, 1);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(x0, y + h - 1, x1 - x0, 1);
  if (x1 - x0 > 40) { ctx.fillStyle = '#DC2626'; ctx.fillRect(x0 + 6, y + 1, (x1 - x0) * 0.3, Math.max(1, h - 2)); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; path(); ctx.stroke();
};

/** The park ranger's log cabin, and afterwards what's left of it under the snow. */
const drawCabin = (ctx: Ctx, state: GameState, ski: Ski) => {
  const c = COURSE.cabin;
  if (!visible(state, c.x - 200, ski.pileX + 60)) return;
  const g = GROUND_Y;
  if (ski.cabinHitAt === 0) {
    const x = c.x, w = 260, h = 130;
    // Log walls: each course lit along its top and dark under, the chinking between them, bark streaks; the ends
    // sticking out at the corners, rings in them
    for (let y = g - h; y < g; y += 13) {
      logAlong(ctx, x, x + w, y + 6.5, 13, (y / 13) % 2 ? '#7C4A24' : '#8B5A2B', false);
      ctx.fillStyle = '#C9B48E'; ctx.fillRect(x, y + 12, w, 1);
      for (const ex of [x, x + w]) {
        ink(ctx, () => ctx.arc(ex, y + 6.5, 6.5, 0, Math.PI * 2), '#5B3A1E');
        ctx.fillStyle = '#B98A55'; ctx.beginPath(); ctx.arc(ex - 1, y + 5.5, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7C5530'; ctx.fillRect(ex - 2, y + 5, 2, 2);
      }
    }
    // Roof: shingles in rows, the eave's dark edge, inked; snowed over (blue in its own shadow along the bottom)
    const roof = () => { ctx.beginPath(); ctx.moveTo(x - 24, g - h); ctx.lineTo(x + w / 2, g - h - 70); ctx.lineTo(x + w + 24, g - h); ctx.closePath(); };
    ctx.save(); roof(); ctx.clip(); shingles(ctx, x - 24, g - h - 70, w + 48, 70, '#7F1D1D'); ctx.restore();
    ctx.fillStyle = '#4C1010'; ctx.fillRect(x - 24, g - h - 3, w + 48, 3);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; roof(); ctx.stroke();
    const snow = () => { ctx.beginPath(); ctx.moveTo(x - 20, g - h - 4); ctx.lineTo(x + w / 2, g - h - 72); ctx.lineTo(x + w + 20, g - h - 4); ctx.lineTo(x + w / 2, g - h - 60); ctx.closePath(); };
    ctx.fillStyle = '#F8FAFC'; snow(); ctx.fill();
    ctx.fillStyle = '#A9BEDA'; ctx.beginPath(); ctx.moveTo(x - 20, g - h - 4); ctx.lineTo(x + w / 2, g - h - 60); ctx.lineTo(x + w + 20, g - h - 4); ctx.lineTo(x + w / 2, g - h - 56); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 1; snow(); ctx.stroke();
    // (the chimney: fieldstone, mortar between, its cap; smoke rolling off it)
    stoneStack(ctx, x + w - 70, g - h - 70, 24, 44);
    for (let i = 0; i < 4; i++) { const k = ((state.frame * 0.5 + i * 25) % 100) / 100, r = 6 + k * 10; pixelBlob(ctx, x + w - 58 + k * 20, g - h - 80 - k * 70, r, r, `rgba(200, 200, 210, ${(0.6 - k * 0.55).toFixed(2)})`); }
    // Door: planks, the frame, a latch
    slab(ctx, x + 26, g - 84, 48, 84, '#2B1D14');
    ctx.fillStyle = '#3F2A1D'; ctx.fillRect(x + 30, g - 80, 40, 80);
    for (let px = x + 30; px < x + 70; px += 10) { ctx.fillStyle = '#56392A'; ctx.fillRect(px, g - 80, 2, 80); ctx.fillStyle = '#21160F'; ctx.fillRect(px + 9, g - 80, 1, 80); }
    ctx.fillStyle = '#2A1B12'; ctx.fillRect(x + 30, g - 66, 40, 4); ctx.fillRect(x + 30, g - 22, 40, 4);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 62, g - 44, 4, 4); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x + 62, g - 44, 2, 2);
    // A lit window with the ranger looking out, horrified (the warm glass in steps behind him)
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 140, g - 100, 70, 50);
    ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 140, g - 100, 70, 14);
    ctx.fillStyle = '#F5C451'; ctx.fillRect(x + 140, g - 62, 70, 12);
    checker(ctx, x + 140, g - 88, 70, 2, '#FEF3C7'); checker(ctx, x + 140, g - 64, 70, 2, '#F5C451');
    ink(ctx, () => ctx.arc(x + 175, g - 70, 11, 0, Math.PI * 2), '#F2C9A0');
    ctx.fillStyle = '#D9A47C'; ctx.beginPath(); ctx.arc(x + 178, g - 68, 8, -0.6, 1.8); ctx.fill();
    // (his campaign hat: the brim, the crown with its pinch, the band)
    ink(ctx, () => ctx.ellipse(x + 175, g - 81, 19, 4, 0, 0, Math.PI * 2), '#A16207');
    ink(ctx, () => { ctx.moveTo(x + 166, g - 81); ctx.lineTo(x + 167, g - 92); ctx.lineTo(x + 175, g - 95); ctx.lineTo(x + 183, g - 92); ctx.lineTo(x + 184, g - 81); ctx.closePath(); }, '#A16207');
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(x + 168, g - 92, 4, 9);
    ctx.fillStyle = '#5B3A12'; ctx.fillRect(x + 167, g - 85, 17, 2);
    // (eyes popping, the brows up, the mouth open)
    for (const ex of [x + 170, x + 180]) { ink(ctx, () => ctx.arc(ex, g - 73, 3, 0, Math.PI * 2), '#FFFFFF', 0.8); ctx.fillStyle = INK; ctx.fillRect(ex - 1, g - 73, 2, 2); }
    ctx.fillStyle = INK; ctx.fillRect(x + 166, g - 79, 6, 1); ctx.fillRect(x + 178, g - 79, 6, 1);
    ink(ctx, () => ctx.ellipse(x + 175, g - 64, 3.5, 4.5, 0, 0, Math.PI * 2), '#3B0A0A', 0.8);
    // (the frame and the cross of the mullions over him, lit and shaded)
    ctx.fillStyle = '#5B3A1E'; ctx.fillRect(x + 174, g - 100, 2, 50); ctx.fillRect(x + 140, g - 76, 70, 2);
    ctx.strokeStyle = '#3F2A1D'; ctx.lineWidth = 3; ctx.strokeRect(x + 140, g - 100, 70, 50);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 137.5, g - 102.5, 75, 55);
    slab(ctx, x + 134, g - 50, 82, 6, '#5B3A1E');
    // Sign
    slab(ctx, x - 60, g - 70, 6, 70, '#3F2A1D', 1);
    slab(ctx, x - 100, g - 90, 90, 30, '#14532D');
    ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 1; ctx.strokeRect(x - 96.5, g - 86.5, 83, 23);
    letter(ctx, 'RANGER', x - 55, g - 78, 'bold 7px "Press Start 2P"', '#FDE68A', '#052E16');
    letter(ctx, 'STATION', x - 55, g - 67, 'bold 7px "Press Start 2P"', '#FDE68A', '#052E16');
  }
  // The pile, once it's come to rest, with what's left of the cabin sticking out of it
  const settled = ski.avX >= ski.pileX || ski.cabinHitAt < 0;
  if (settled) drawPile(ctx, state, ski);
  if (ski.cabinHitAt !== 0 && settled) drawWreck(ctx, state, ski);
};

/** The top of the snow pile at x (it's a fixed shape: a ramp up from its front, then a long flat top). */
const pileTopAt = (ski: Ski, x: number) => {
  const g = GROUND_Y, x2 = ski.pileX;
  if (x >= x2 - 120) return g - 240 + ((x - (x2 - 120)) / 120) * 240 * Math.min(1, (x - (x2 - 120)) / 120);
  return g - 240 - 60 * Math.min(1, (x2 - 120 - x) / 480);
};

const drawPile = (ctx: Ctx, state: GameState, ski: Ski) => {
  const g = GROUND_Y, x2 = ski.pileX, xl = Math.min(x2 - 600, viewOf(state).x - 100);
  const pile = () => {
    ctx.beginPath();
    ctx.moveTo(x2, g);
    ctx.quadraticCurveTo(x2 + 10, g - 200, x2 - 120, g - 240);
    ctx.lineTo(x2 - 600, g - 300);
    ctx.lineTo(xl, g - 300);
    ctx.lineTo(xl, g + 60);
    ctx.lineTo(x2, g + 60);
  };
  // (the snow in bands, bright up top, bluer as it goes down into its own shadow; lumps and blocks of it, each lit
  // on top and shadowed under; inked along the crest)
  ctx.save(); pile(); ctx.clip();
  bandedGradient(ctx, xl, g - 310, x2 + 20 - xl, 370, ['#FFFFFF', '#EEF4FB', '#DCE6F3', '#C5D4E8', '#AFC2DD'], 10);
  ctx.fillStyle = '#C3D3E8'; ctx.fillRect(x2 - 14, g - 200, 30, 260);
  checker(ctx, x2 - 20, g - 200, 6, 260, '#C3D3E8');
  for (let i = 0; i < 8; i++) {
    const lx = x2 - 40 - i * 60, ly = g - 200 - (i % 3) * 20;
    ctx.fillStyle = '#B4C6DE'; ctx.beginPath(); ctx.ellipse(lx + 2, ly + 3, 40, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E3ECF6'; ctx.beginPath(); ctx.ellipse(lx, ly, 40, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(lx - 8, ly - 5, 24, 6, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x2, g); ctx.quadraticCurveTo(x2 + 10, g - 200, x2 - 120, g - 240); ctx.lineTo(x2 - 600, g - 300); ctx.lineTo(xl, g - 300); ctx.stroke();
};

/** A stack of fieldstone (a chimney), w x h at (x, y): stones in two greys, mortar, each lit on top, inked; a cap. */
const stoneStack = (ctx: Ctx, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#3A3633'; ctx.fillRect(x, y, w, h);
  for (let r = 0, sy = y + 4; sy < y + h; r++, sy += 8) for (let sx = x + (r % 2 ? -5 : 0); sx < x + w; sx += 10) {
    const x0 = Math.max(x + 1, sx + 1), x1 = Math.min(x + w - 1, sx + 9);
    if (x1 <= x0) continue;
    ctx.fillStyle = (r + Math.round(sx / 10)) % 3 ? '#6B6560' : '#57534E'; ctx.fillRect(x0, sy + 1, x1 - x0, 6);
    ctx.fillStyle = '#8C857E'; ctx.fillRect(x0, sy + 1, x1 - x0, 1);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; ctx.fillRect(x + w - 5, y, 5, h);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  slab(ctx, x - 3, y - 2, w + 6, 6, '#44403C');
};

/** How much bigger than life-size the buried ranger's drawn (so you can see what happened to him). */
const RANGER_SCALE = 1.35;
/** His legs, relative to the rest of him (they were looming a bit). */
const RANGER_LEG_SCALE = 0.75;

/**
 * The ranger, planted head-first in the snow up to his belt: legs splayed in
 * the air, one boot blown off, blood seeping out pink around him, a glove
 * sticking out of the snow still gripping his radio. Every so often the legs
 * spasm, and the radio asks if he's there.
 */
const drawBuriedRanger = (ctx: Ctx, state: GameState, bx: number, by: number, radio: boolean) => {
  const f = state.frame;
  ctx.save();
  ctx.translate(bx, by); ctx.scale(RANGER_SCALE, RANGER_SCALE);
  const x = 0, y = 0;
  // A spasm every couple of seconds, a little shiver in between
  const cycle = f % 130;
  const spasm = cycle < 16 ? Math.sin(cycle * 1.9) * (1 - cycle / 16) : 0;
  const shiver = Math.sin(f * 0.9) * 0.02;
  // Blood seeping up through the snow around him (it's spreading)
  const seep = Math.min(1, 0.55 + (f % 2400) / 2400 * 0.45);
  pixEllipse(ctx, x, y + 2, 58 * seep, 11 * seep, 'rgba(190, 18, 60, 0.28)');
  pixEllipse(ctx, x - 4, y + 1, 30 * seep, 6 * seep, 'rgba(153, 27, 27, 0.55)');
  ctx.fillStyle = '#7F1D1D';
  for (const [dx, dy, r] of [[-38, 4, 3], [34, -1, 2.5], [22, 7, 2], [-18, 8, 2]] as [number, number, number][]) ctx.fillRect(Math.round(x + dx * seep - r), Math.round(y + dy - r * 0.6), Math.round(r * 2), Math.max(2, Math.round(r * 1.2)));
  // His backside and belt, the only bit of the top half still out (shaded, inked; the buckle catching the light)
  shadedTop(ctx, () => ctx.ellipse(x, y - 6, 17, 11, 0, Math.PI, 0), '#4D5A2A', x - 17, y - 17, 34, 11);
  ctx.fillStyle = '#3B4520'; ctx.fillRect(x, y - 15, 1, 9);
  slab(ctx, x - 17, y - 3, 34, 5, '#3F2A1D', 1);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x - 3, y - 3, 6, 5); // buckle
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(x - 3, y - 3, 2, 2); ctx.fillStyle = '#A16207'; ctx.fillRect(x - 1, y - 1, 2, 1);
  // Legs, splayed up in a V, kicking when the spasm hits
  const leg = (side: number, boot: boolean) => {
    ctx.save();
    ctx.translate(x + side * 8, y - 12);
    ctx.rotate(side * (0.32 + spasm * 0.35) + shiver);
    ctx.scale(RANGER_LEG_SCALE, RANGER_LEG_SCALE);
    // Thigh and shin, knee bent a touch, jerking straighter on a spasm (shaded, inked)
    shaded(ctx, () => ctx.rect(-6, -34, 12, 34), '#4D5A2A', -6, -34, 12, 34);
    ctx.translate(0, -32); ctx.rotate(-side * (0.18 - spasm * 0.3));
    shaded(ctx, () => ctx.rect(-5, -30, 10, 32), '#4D5A2A', -5, -30, 10, 32);
    ctx.fillStyle = '#3B4520'; ctx.fillRect(-5, -8, 10, 2); // trouser cuff
    if (boot) {
      shaded(ctx, () => ctx.rect(-6, -42, 13, 13), '#3F2A1D', -6, -42, 13, 13);
      slab(ctx, -6, -45, 13, 4, '#1C1917', 1);
      ctx.fillStyle = '#FDE68A'; for (let ly = -40; ly < -31; ly += 3) ctx.fillRect(-2, ly, 4, 1); // laces
    } else {
      // Boot's gone: a grey sock with a hole, a big toe poking out
      shaded(ctx, () => ctx.rect(-5, -40, 11, 12), '#9CA3AF', -5, -40, 11, 12);
      ctx.fillStyle = '#6B7280'; ctx.fillRect(-5, -32, 11, 2);
      ink(ctx, () => ctx.arc(2, -40, 3, 0, Math.PI * 2), '#F2C9A0');
      ctx.fillStyle = '#FFE4CF'; ctx.fillRect(1, -42, 1, 1);
    }
    ctx.restore();
  };
  leg(-1, true);
  leg(1, false);
  // The missing boot, lying a little way off
  ctx.save(); ctx.translate(x - 52, y - 2); ctx.rotate(-1.2);
  shaded(ctx, () => ctx.rect(-6, -7, 13, 14), '#3F2A1D', -6, -7, 13, 14); slab(ctx, -6, 6, 13, 3, '#1C1917', 1);
  ctx.restore();
  // A glove through the snow, still holding the radio, fingers twitching
  const gx = x + 40, gy = y + 3;
  shaded(ctx, () => ctx.rect(gx - 4, gy - 16, 9, 16), '#4D5A2A', gx - 4, gy - 16, 9, 16); // sleeve
  shaded(ctx, () => ctx.rect(gx + 5, gy - 30 - (cycle < 16 ? 3 : 0), 3, 7), '#78350F', gx + 5, gy - 33, 3, 10); // twitching finger
  shaded(ctx, () => ctx.rect(gx - 4, gy - 44, 10, 20), '#1F2937', gx - 4, gy - 44, 10, 20); // radio
  ctx.fillStyle = '#4B5563'; for (let ry = gy - 36; ry < gy - 27; ry += 2) ctx.fillRect(gx - 2, ry, 6, 1); // (its grille)
  slab(ctx, gx + 3, gy - 54, 2, 10, '#111827', 0); // aerial
  ctx.fillStyle = Math.floor(f / 20) % 2 ? '#22C55E' : '#14532D'; ctx.fillRect(gx - 2, gy - 41, 3, 3);
  shaded(ctx, () => ctx.rect(gx - 6, gy - 26, 13, 11), '#78350F', gx - 6, gy - 26, 13, 11); // glove
  ctx.fillStyle = '#5A270B'; ctx.fillRect(gx - 6, gy - 22, 13, 1); ctx.fillRect(gx - 6, gy - 19, 13, 1);
  // Now and then, the radio
  const chat = f % RANGER_RADIO_EVERY;
  if (radio && chat < 150) {
    const line = 'KSSH... ' + RANGER_RADIO[Math.floor(f / RANGER_RADIO_EVERY) % RANGER_RADIO.length];
    ctx.font = 'bold 7px "Press Start 2P"';
    const w = ctx.measureText(line).width + 12;
    const tx = gx - w / 2, ty = gy - 86;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; ctx.fillRect(tx, ty, w, 18);
    ctx.beginPath(); ctx.moveTo(gx - 4, ty + 18); ctx.lineTo(gx + 4, ty + 18); ctx.lineTo(gx, ty + 28); ctx.fill();
    ctx.strokeStyle = '#86EFAC'; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.strokeRect(tx + 1.5, ty + 1.5, w - 3, 15); ctx.globalAlpha = 1;
    ctx.fillStyle = '#86EFAC'; ctx.textAlign = 'left'; ctx.fillText(line, tx + 6, ty + 12);
  }
  ctx.restore();
};

/** What's left of the ranger station: roof, logs, chimney, sign and the ranger himself, all sticking out of the snow. */
const drawWreck = (ctx: Ctx, state: GameState, ski: Ski) => {
  const c = COURSE.cabin;
  const top = (x: number) => pileTopAt(ski, x);
  const piece = (x: number, y: number, rot: number, draw: () => void) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); draw(); ctx.restore(); };
  // Logs from the walls, speared into the pile every which way (ends showing their rings)
  const logs: [number, number, number][] = [[c.x - 50, 10, -0.5], [c.x + 20, 14, 0.35], [c.x + 95, 12, -0.15], [c.x + 150, 6, 0.6], [c.x + 320, 60, 0.3], [ski.pileX - 30, 150, -0.4]];
  for (const [x, sink, rot] of logs) {
    piece(x, top(x) + sink, rot, () => logAlong(ctx, -46, 46, 0, 16, '#7C4A24'));
  }
  // The roof, torn off in one piece and stuck in the snow at an angle, still snowed on
  piece(c.x + 60, top(c.x + 60) + 20, -0.42, () => {
    const roof = () => { ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(10, -70); ctx.lineTo(130, 0); ctx.closePath(); };
    ctx.save(); roof(); ctx.clip(); shingles(ctx, -120, -70, 250, 70, '#7F1D1D'); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; roof(); ctx.stroke();
    // Snapped rafters poking out of the underside (splintered ends)
    for (const rx of [-80, -30, 30, 80]) {
      const len = 22 + (rx % 3) * 4;
      slab(ctx, rx, 0, 7, len, '#A16207', 1);
      ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.moveTo(rx, len); ctx.lineTo(rx + 2, len + 5); ctx.lineTo(rx + 4, len); ctx.lineTo(rx + 6, len + 3); ctx.lineTo(rx + 7, len); ctx.closePath(); ctx.fill();
    }
    slab(ctx, -120, -4, 250, 8, '#5F1414');
    const snow = () => { ctx.beginPath(); ctx.moveTo(-110, -6); ctx.lineTo(10, -72); ctx.lineTo(120, -6); ctx.lineTo(10, -58); ctx.closePath(); };
    ctx.fillStyle = '#F8FAFC'; snow(); ctx.fill();
    ctx.fillStyle = '#A9BEDA'; ctx.beginPath(); ctx.moveTo(-110, -6); ctx.lineTo(10, -58); ctx.lineTo(120, -6); ctx.lineTo(10, -54); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 1; snow(); ctx.stroke();
  });
  // The window frame, glass gone, a curtain still hanging in it
  piece(c.x - 35, top(c.x - 35) - 12, 0.25, () => {
    ctx.fillStyle = '#3F2A1D'; ctx.fillRect(-37.5, -27.5, 75, 5); ctx.fillRect(-37.5, 22.5, 75, 5); ctx.fillRect(-37.5, -27.5, 5, 55); ctx.fillRect(32.5, -27.5, 5, 55);
    ctx.fillStyle = '#5E4030'; ctx.fillRect(-37.5, -27.5, 75, 2); ctx.fillRect(-37.5, -27.5, 2, 55);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-37.5, -27.5, 75, 55); ctx.strokeRect(-32.5, -22.5, 65, 45);
    const curtain = () => { ctx.beginPath(); ctx.moveTo(-32, -22); ctx.lineTo(-8, -22); ctx.quadraticCurveTo(-18, 0, -30, 20); ctx.closePath(); };
    ctx.fillStyle = '#B91C1C'; curtain(); ctx.fill();
    ctx.save(); curtain(); ctx.clip(); ctx.fillStyle = '#7F1D1D'; for (let fx = -30; fx < -8; fx += 6) ctx.fillRect(fx + 3, -22, 2, 44); ctx.fillStyle = '#EF4444'; for (let fx = -30; fx < -8; fx += 6) ctx.fillRect(fx, -22, 1, 44); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; curtain(); ctx.stroke();
    ink(ctx, () => { ctx.moveTo(32, -22); ctx.lineTo(20, -22); ctx.lineTo(30, -2); ctx.closePath(); }, 'rgba(224, 242, 254, 0.8)');
  });
  // The chimney, snapped off and lying on its side, still smoking
  const chx = c.x + 135, chy = top(c.x + 135) - 8;
  piece(chx, chy, 1.35, () => stoneStack(ctx, -12, -40, 24, 44));
  for (let i = 0; i < 4; i++) {
    const k = ((state.frame * 0.4 + i * 25) % 100) / 100, r = 5 + k * 9;
    pixelBlob(ctx, chx - 44 - k * 10, chy - 10 - k * 60, r, r, `rgba(160, 160, 170, ${(0.5 - k * 0.45).toFixed(2)})`);
  }
  // RANGER STATION, bent over
  piece(c.x - 95, top(c.x - 95) + 6, -0.35, () => {
    slab(ctx, -3, -48, 6, 50, '#3F2A1D', 1);
    slab(ctx, -45, -70, 90, 30, '#14532D');
    ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 1; ctx.strokeRect(-41.5, -66.5, 83, 23);
    letter(ctx, 'RANGER', 0, -58, 'bold 7px "Press Start 2P"', '#FDE68A', '#052E16');
    letter(ctx, 'STATION', 0, -47, 'bold 7px "Press Start 2P"', '#FDE68A', '#052E16');
  });
  drawBuriedRanger(ctx, state, c.x + 225, top(c.x + 225) + 6, radioLive(state, ski));
  // His hat, blown clean off and landed up the pile from him (the brim, the pinched crown, the band)
  const hx = c.x + 305, hy = top(c.x + 305) - 4;
  ink(ctx, () => ctx.ellipse(hx, hy, 20, 5, 0.15, 0, Math.PI * 2), '#A16207');
  shaded(ctx, () => { ctx.moveTo(hx - 10, hy); ctx.lineTo(hx - 9, hy - 11); ctx.lineTo(hx - 1, hy - 13); ctx.lineTo(hx + 7, hy - 11); ctx.lineTo(hx + 8, hy); ctx.closePath(); }, '#A16207', hx - 10, hy - 13, 18, 13);
  ctx.fillStyle = '#78350F'; ctx.fillRect(hx - 10, hy - 5, 18, 3);
};

// ---------------------------------------------------------------------------
// In front: the avalanche, the snowball, Meathead's skis
// ---------------------------------------------------------------------------

export const drawSkiFront = (ctx: Ctx, state: GameState, ski: Ski) => {
  const p = state.player;
  // His skis, under his feet, following the slope
  if (p.skiing && !p.hidden && state.deathTimer <= 0) {
    const fx = p.pos.x + p.width / 2, fy = p.pos.y + p.height;
    const ahead = groundAt(state, fx + 20), behind = groundAt(state, fx - 20);
    const ang = p.isGrounded ? Math.atan2(ahead - behind, 40) : -0.15;
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(ang);
    // (the ski: the turned-up tip, lit along the top, a red stripe, inked; the bindings on it)
    const ski = () => { ctx.beginPath(); ctx.moveTo(-34, -3); ctx.lineTo(36, -3); ctx.quadraticCurveTo(40, -4, 42, -10); ctx.lineTo(44, -9); ctx.quadraticCurveTo(43, 1, 36, 1); ctx.lineTo(-34, 1); ctx.closePath(); };
    ctx.fillStyle = '#FACC15'; ski(); ctx.fill();
    ctx.fillStyle = '#EAB308'; ctx.beginPath(); ctx.moveTo(36, -3); ctx.quadraticCurveTo(40, -4, 42, -10); ctx.lineTo(44, -9); ctx.quadraticCurveTo(43, 1, 36, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FEF08A'; ctx.fillRect(-34, -3, 70, 1);
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(-34, 0, 70, 1);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(18, -2, 14, 2); ctx.fillRect(-30, -2, 14, 2);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ski(); ctx.stroke();
    slab(ctx, -10, -6, 8, 4, '#111827', 1); slab(ctx, 4, -6, 8, 4, '#111827', 1);
    ctx.restore();
  }
  // Low branches reach across the run in front of everything: bold, dark-edged, iced (duck them)
  COURSE.ski.obstacles.forEach((o, i) => { if (o.kind === 'branch' && !ski.broken[i] && visible(state, o.x - 80, o.x + 80)) drawLimb(ctx, o.x, o.ground, state.frame); });
  if (ski.ball > 0) drawBall(ctx, state, ski);
  if (ski.phase === 'skiing' || ski.phase === 'runout' || (ski.phase === 'finale' && ski.avX < ski.pileX) || (ski.phase === 'cutscene' && ski.surge)) drawAvalanche(ctx, state, ski);
};

/** Meathead rolled up in a snowball: limbs and a furious face poking out as it tumbles. */
const drawBall = (ctx: Ctx, state: GameState, ski: Ski) => {
  const r = 46;
  const g = groundAt(state, ski.ballX);
  ctx.save();
  ctx.translate(ski.ballX, g - r);
  ctx.rotate(ski.ballRot);
  // (the snow lit from the upper left whichever way it's turned)
  ctx.rotate(-ski.ballRot); snowDisc(ctx, 0, 0, r, 2); ctx.rotate(ski.ballRot);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, Math.PI * 2); ctx.clip();
  for (let i = 0; i < 6; i++) { const a = i * 1.1, d = 14 + (i * 9) % 22; ctx.fillStyle = 'rgba(100, 125, 165, 0.35)'; ctx.beginPath(); ctx.arc(Math.cos(a) * d + 1, Math.sin(a) * d + 1, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // Arms and legs sticking out, flailing (inked, shaded; boots on the legs, fists on the arms)
  for (let i = 0; i < 4; i++) {
    const a = i * (Math.PI / 2) + 0.4;
    ctx.save(); ctx.rotate(a);
    shaded(ctx, () => ctx.rect(r - 6, -5, 18, 10), '#E0AC69', r - 6, -5, 18, 10);
    if (i < 2) shaded(ctx, () => ctx.rect(r + 10, -6, 8, 12), '#1E3A8A', r + 10, -6, 8, 12);
    else ink(ctx, () => ctx.arc(r + 14, 0, 6, 0, Math.PI * 2), '#E0AC69');
    ctx.restore();
  }
  // His head, poking out: the flat-top, the eyes bugging, the teeth gritted
  ink(ctx, () => ctx.arc(0, -r + 6, 12, 0, Math.PI * 2), '#E0AC69');
  ctx.fillStyle = '#C08A50'; ctx.beginPath(); ctx.arc(3, -r + 8, 9, -0.4, 1.9); ctx.fill();
  slab(ctx, -10, -r - 6, 20, 5, '#18181B', 1);
  ink(ctx, () => ctx.rect(-7, -r + 4, 5, 3), '#FFF', 0.8); ink(ctx, () => ctx.rect(2, -r + 4, 5, 3), '#FFF', 0.8);
  ctx.fillStyle = INK; ctx.fillRect(-5, -r + 5, 2, 2); ctx.fillRect(4, -r + 5, 2, 2);
  ink(ctx, () => ctx.rect(-6, -r + 10, 12, 3), '#F8FAFC', 0.8);
  ctx.fillStyle = INK; for (let tx = -3; tx < 6; tx += 3) ctx.fillRect(tx, -r + 10, 1, 3);
  ctx.restore();
};

/** A wall of churning snow, taller than the screen, with trees and rocks tumbling in it. */
const drawAvalanche = (ctx: Ctx, state: GameState, ski: Ski) => {
  const front = ski.avX;
  const v = viewOf(state);
  const left = v.x - 60, bottom = v.y + v.h + 100;
  if (front < left) return;
  const f = state.frame;
  const topAt = (x: number) => snowLineAt(state, x) - 420 - Math.sin(x * 0.02 + f * 0.1) * 30;
  // Body
  ctx.fillStyle = '#E2EAF4';
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  for (let x = left; x <= front; x += 30) ctx.lineTo(x, topAt(x));
  ctx.lineTo(front, snowLineAt(state, front));
  ctx.lineTo(front, bottom);
  ctx.closePath();
  ctx.fill();
  // (the snow in bands: bright up top, blue in its own shadow down the face)
  ctx.save(); ctx.clip(); bandedGradient(ctx, left - 20, v.y, front - left + 40, v.h, ['#F8FAFC', '#EEF3F9', '#E2EAF4', '#D4DEEC', '#C7D6EA'], 10); ctx.restore();
  // (churned clods all through it, each lit on top, its shadow under)
  for (let i = 0; i < 22; i++) {
    const cx = front - 40 - ((i * 137 + f * 2) % Math.max(60, front - left)), cy = snowLineAt(state, cx) - 30 - ((i * 89 + f) % 380), cr = 8 + (i % 4) * 5;
    if (cx < left) continue;
    ctx.fillStyle = '#B9CBE2'; ctx.beginPath(); ctx.arc(cx + 2, cy + 3, cr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F4F8FC'; ctx.beginPath(); ctx.arc(cx, cy, cr * 0.8, 0, Math.PI * 2); ctx.fill();
  }
  // Tumbling debris inside it (a pine, a rock: inked, shaded)
  for (let i = 0; i < 6; i++) {
    const dx = front - 60 - ((f * 3 + i * 97) % 500);
    if (dx < left) continue;
    const dy = snowLineAt(state, dx) - 60 - ((i * 71 + f * 2) % 280);
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(f * 0.1 + i);
    if (i % 2) {
      slab(ctx, -2, 12, 4, 8, '#3F2A1D', 1);
      pineTier(ctx, 0, -20, 12, 10, { shade: '#14532D', lit: '#22803F', ink: INK }, false);
    } else {
      const rr = 10 + (i % 3) * 4;
      ink(ctx, () => ctx.arc(0, 0, rr, 0, Math.PI * 2), '#57534E', 1.5);
      ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.arc(-rr * 0.25, -rr * 0.25, rr * 0.55, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(-rr * 0.45, -rr * 0.5, 3, 2);
    }
    ctx.restore();
  }
  // Billowing front edge: each billow in steps (the blue of its shadow, the snow, a lit cap), inked round the outside
  const billows: [number, number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const y = snowLineAt(state, front) - i * 32;
    billows.push([front + Math.sin(f * 0.2 + i * 1.3) * 12, y, 30 + ((i * 17 + f) % 20)]);
  }
  ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 3;
  for (const [bx, y, br] of billows) { ctx.beginPath(); ctx.arc(bx, y, br, -Math.PI / 2, Math.PI / 2); ctx.stroke(); }
  billows.forEach(([bx, y, br], i) => {
    ctx.fillStyle = '#B4C6DE'; ctx.beginPath(); ctx.arc(bx, y, br, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = i % 2 ? '#F4F8FC' : '#E2ECF7'; ctx.beginPath(); ctx.arc(bx - br * 0.1, y - br * 0.12, br * 0.86, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(bx - br * 0.2, y - br * 0.35, br * 0.42, Math.PI, 0); ctx.fill();
  });
  // Spray ahead of it
  for (let i = 0; i < 20; i++) {
    const sx = Math.round((front + 10 + ((f * 7 + i * 41) % 140)) / 2) * 2;
    const sy = Math.round((snowLineAt(state, front) - ((i * 53 + f * 3) % 380)) / 2) * 2, sz = 2 + (i % 3) * 2;
    ctx.fillStyle = 'rgba(167, 188, 214, 0.8)'; ctx.fillRect(sx + 1, sy + 1, sz, sz);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(sx, sy, sz, sz);
  }
};

/** How close it is. */
export const drawSkiHud = (ctx: Ctx, state: GameState, ski: Ski) => {
  if (ski.phase !== 'skiing') return;
  const gap = Math.max(0, state.player.pos.x - ski.avX);
  const k = Math.max(0, Math.min(1, 1 - gap / 800));
  ctx.save();
  // (right of the main HUD, like the other bars up top)
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(330, 14, 450, 28);
  ctx.fillStyle = '#1E293B'; ctx.fillRect(338, 32, 434, 6);
  ctx.fillStyle = k > 0.7 ? '#EF4444' : k > 0.4 ? '#F59E0B' : '#38BDF8';
  ctx.fillRect(338, 32, 434 * k, 6);
  ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#F8FAFC'; ctx.fillText('AVALANCHE', 555, 27);
  if (k > 0.7 && Math.floor(state.frame / 10) % 2 === 0) {
    ctx.font = 'bold 16px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText('GO GO GO', 557, 76);
    ctx.fillStyle = '#EF4444'; ctx.fillText('GO GO GO', 555, 74);
  }
  ctx.restore();
};
