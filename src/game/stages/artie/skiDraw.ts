// The ski run's pieces: the skier, his skis, the obstacles, the avalanche,
// Meathead rolled up in a snowball, the ranger cabin and the snow pile.

import type { GameState } from '../../state';
import { groundLineAt } from '../../terrain';
import { GROUND_Y } from '../../../constants';
import { COURSE } from './course';
import type { Ski } from './ski';

type Ctx = CanvasRenderingContext2D;

const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 80 && x1 < state.camera.x + 880;
const groundAt = (state: GameState, x: number) => { const g = groundLineAt(state.groundRuns, x); return g === Infinity ? state.camera.y + 600 : g; };

// ---------------------------------------------------------------------------
// Behind Meathead: obstacles, the skier, the cabin, the pile
// ---------------------------------------------------------------------------

export const drawSkiMid = (ctx: Ctx, state: GameState, ski: Ski) => {
  COURSE.ski.obstacles.forEach((o, i) => { if (!ski.broken[i] && visible(state, o.x - 60, o.x + 60)) drawObstacle(ctx, o.kind, o.x, o.ground, state.frame); });
  drawSkier(ctx, state, ski);
  drawCabin(ctx, state, ski);
};

const drawObstacle = (ctx: Ctx, kind: string, x: number, g: number, frame: number) => {
  switch (kind) {
    case 'rock':
      ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(x - 24, g); ctx.lineTo(x - 18, g - 22); ctx.lineTo(x - 2, g - 32); ctx.lineTo(x + 16, g - 26); ctx.lineTo(x + 24, g); ctx.fill();
      ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.moveTo(x - 16, g - 20); ctx.lineTo(x - 2, g - 30); ctx.lineTo(x + 4, g - 16); ctx.fill();
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(x - 2, g - 30, 14, 4, -0.1, 0, Math.PI * 2); ctx.fill();
      break;
    case 'log':
      ctx.fillStyle = '#5B3A1E'; ctx.fillRect(x - 34, g - 22, 68, 20);
      ctx.fillStyle = '#7C4A24'; ctx.fillRect(x - 34, g - 22, 68, 5);
      ctx.fillStyle = '#C08A4E'; ctx.beginPath(); ctx.ellipse(x + 34, g - 12, 6, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8A5A2B'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x + 34, g - 12, 3, 6, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 30, g - 25, 50, 4);
      break;
    case 'pine':
      ctx.fillStyle = '#3F2A1D'; ctx.fillRect(x - 3, g - 14, 6, 14);
      for (let k = 0; k < 3; k++) {
        const top = g - 76 + k * 18, half = 10 + k * 6;
        ctx.fillStyle = '#14532D'; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - half, top + 26); ctx.lineTo(x + half, top + 26); ctx.fill();
        ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(x, top + 2); ctx.lineTo(x - half * 0.6, top + 14); ctx.lineTo(x + half * 0.3, top + 12); ctx.fill();
      }
      break;
    case 'branch': {
      // A big tree beside the run with a limb reaching right across it at head height
      const tx = x + 58;
      ctx.fillStyle = '#2B1D14'; ctx.fillRect(tx - 8, g - 220, 16, 220);
      ctx.fillStyle = '#3F2A1D';
      ctx.beginPath(); ctx.moveTo(tx, g - 104); ctx.lineTo(x - 46, g - 90 + Math.sin(frame * 0.05) * 1.5); ctx.lineTo(x - 46, g - 80); ctx.lineTo(tx, g - 90); ctx.fill();
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 44, g - 94, 96, 4);
      ctx.fillStyle = '#14532D';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - 40 + k * 22, g - 86); ctx.lineTo(x - 30 + k * 22, g - 64); ctx.lineTo(x - 20 + k * 22, g - 86); ctx.fill(); }
      ctx.fillStyle = '#14532D'; ctx.beginPath(); ctx.moveTo(tx, g - 300); ctx.lineTo(tx - 50, g - 150); ctx.lineTo(tx + 50, g - 150); ctx.fill();
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
  if (sk.state === 'stand') { ctx.fillStyle = '#FACC15'; ctx.fillRect(-26, -3, 56, 4); ctx.fillRect(28, -6, 5, 4); }
  // Legs, jacket, arms on poles
  ctx.fillStyle = '#111827'; ctx.fillRect(-8, -30, 7, 27); ctx.fillRect(2, -30, 7, 27);
  ctx.fillStyle = '#EC4899'; ctx.fillRect(-11, -56, 23, 28);
  ctx.fillStyle = '#22D3EE'; ctx.fillRect(-11, -48, 23, 5); ctx.fillStyle = '#A3E635'; ctx.fillRect(-11, -43, 23, 3);
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(10, -44); ctx.lineTo(22, -2); ctx.moveTo(-8, -44); ctx.lineTo(-18, -2); ctx.stroke();
  // Helmet and mirrored goggles
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(1, -64, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(-9, -64, 20, 6);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(-7, -60, 16, 8);
  ctx.fillStyle = '#7C3AED'; ctx.fillRect(-2, -61, 12, 4);
  ctx.restore();
  // What he's saying
  if (sk.lineT > 0 && sk.line) {
    ctx.save();
    ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
    const w = ctx.measureText(sk.line).width + 14;
    const bx = sk.x, by = sk.y - 96;
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillRect(bx - w / 2, by - 14, w, 22);
    ctx.beginPath(); ctx.moveTo(bx - 6, by + 8); ctx.lineTo(bx, by + 16); ctx.lineTo(bx + 4, by + 8); ctx.fill();
    ctx.fillStyle = '#111'; ctx.fillText(sk.line, bx, by + 2);
    ctx.restore();
  }
  drawSkis(ctx, state, ski);
};

/** The stolen skis, spinning through the air on their way to Meathead's feet. */
const drawSkis = (ctx: Ctx, _state: GameState, ski: Ski) => {
  const s = ski.skis;
  if (!s) return;
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-28, -4, 56, 4); ctx.fillRect(-28, 2, 56, 4);
  ctx.restore();
};

/** The park ranger's log cabin, and afterwards what's left of it under the snow. */
const drawCabin = (ctx: Ctx, state: GameState, ski: Ski) => {
  const c = COURSE.cabin;
  if (!visible(state, c.x - 200, ski.pileX + 60)) return;
  const g = GROUND_Y;
  if (ski.cabinHitAt === 0) {
    const x = c.x, w = 260, h = 130;
    // Log walls
    for (let y = g - h; y < g; y += 13) {
      ctx.fillStyle = (y / 13) % 2 ? '#7C4A24' : '#8B5A2B'; ctx.fillRect(x, y, w, 13);
      ctx.fillStyle = '#5B3A1E'; ctx.beginPath(); ctx.arc(x, y + 6.5, 6.5, 0, Math.PI * 2); ctx.arc(x + w, y + 6.5, 6.5, 0, Math.PI * 2); ctx.fill();
    }
    // Roof, snowed over, and the chimney smoking
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.moveTo(x - 24, g - h); ctx.lineTo(x + w / 2, g - h - 70); ctx.lineTo(x + w + 24, g - h); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(x - 20, g - h - 4); ctx.lineTo(x + w / 2, g - h - 72); ctx.lineTo(x + w + 20, g - h - 4); ctx.lineTo(x + w / 2, g - h - 60); ctx.fill();
    ctx.fillStyle = '#57534E'; ctx.fillRect(x + w - 70, g - h - 70, 24, 44);
    for (let i = 0; i < 4; i++) { const k = ((state.frame * 0.5 + i * 25) % 100) / 100; ctx.fillStyle = `rgba(200,200,210,${0.6 - k * 0.55})`; ctx.beginPath(); ctx.arc(x + w - 58 + k * 20, g - h - 80 - k * 70, 6 + k * 10, 0, Math.PI * 2); ctx.fill(); }
    // Door and a lit window with the ranger looking out, horrified
    ctx.fillStyle = '#3F2A1D'; ctx.fillRect(x + 30, g - 80, 40, 80);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 140, g - 100, 70, 50);
    ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(x + 175, g - 70, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#A16207'; ctx.beginPath(); ctx.ellipse(x + 175, g - 81, 19, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x + 166, g - 93, 18, 12);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + 175, g - 64, 4, 0, Math.PI * 2); ctx.fill(); // mouth open
    ctx.strokeStyle = '#3F2A1D'; ctx.lineWidth = 3; ctx.strokeRect(x + 140, g - 100, 70, 50);
    // Sign
    ctx.fillStyle = '#3F2A1D'; ctx.fillRect(x - 60, g - 70, 6, 70);
    ctx.fillStyle = '#14532D'; ctx.fillRect(x - 100, g - 90, 90, 30);
    ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('RANGER', x - 55, g - 78); ctx.fillText('STATION', x - 55, g - 67); ctx.textAlign = 'left';
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
  const g = GROUND_Y, x2 = ski.pileX;
  ctx.fillStyle = '#EEF4FB';
  ctx.beginPath();
  ctx.moveTo(x2, g);
  ctx.quadraticCurveTo(x2 + 10, g - 200, x2 - 120, g - 240);
  ctx.lineTo(x2 - 600, g - 300);
  ctx.lineTo(Math.min(x2 - 600, state.camera.x - 100), g - 300);
  ctx.lineTo(Math.min(x2 - 600, state.camera.x - 100), g + 60);
  ctx.lineTo(x2, g + 60);
  ctx.fill();
  ctx.fillStyle = '#CFE0F3';
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(x2 - 40 - i * 60, g - 200 - (i % 3) * 20, 40, 14, 0, 0, Math.PI * 2); ctx.fill(); }
};

/** What's left of the ranger station: roof, logs, chimney, sign and the ranger himself, all sticking out of the snow. */
const drawWreck = (ctx: Ctx, state: GameState, ski: Ski) => {
  const c = COURSE.cabin;
  const top = (x: number) => pileTopAt(ski, x);
  const slab = (x: number, y: number, rot: number, draw: () => void) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); draw(); ctx.restore(); };
  // Logs from the walls, speared into the pile every which way (ends showing their rings)
  const logs: [number, number, number][] = [[c.x - 50, 10, -0.5], [c.x + 20, 14, 0.35], [c.x + 95, 12, -0.15], [c.x + 250, 6, 0.6], [c.x + 290, 20, -0.9], [c.x + 320, 60, 0.3], [ski.pileX - 30, 150, -0.4]];
  for (const [x, sink, rot] of logs) {
    slab(x, top(x) + sink, rot, () => {
      ctx.fillStyle = '#7C4A24'; ctx.fillRect(-46, -8, 92, 16);
      ctx.fillStyle = '#5B3A1E'; ctx.fillRect(-46, -2, 92, 3);
      ctx.fillStyle = '#C08A4E'; ctx.beginPath(); ctx.ellipse(46, 0, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7C4A24'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(46, 0, 2.5, 4, 0, 0, Math.PI * 2); ctx.stroke();
    });
  }
  // The roof, torn off in one piece and stuck in the snow at an angle, still snowed on
  slab(c.x + 150, top(c.x + 150) + 20, -0.42, () => {
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(10, -70); ctx.lineTo(130, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5F1414'; ctx.fillRect(-120, -4, 250, 8);
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-110, -6); ctx.lineTo(10, -72); ctx.lineTo(120, -6); ctx.lineTo(10, -58); ctx.fill();
    // Snapped rafters poking out of the underside
    ctx.fillStyle = '#A16207';
    for (const rx of [-80, -30, 30, 80]) ctx.fillRect(rx, 0, 7, 22 + (rx % 3) * 4);
  });
  // The window frame, glass gone, a curtain still hanging in it
  slab(c.x + 40, top(c.x + 40) - 12, 0.25, () => {
    ctx.strokeStyle = '#3F2A1D'; ctx.lineWidth = 5; ctx.strokeRect(-35, -25, 70, 50);
    ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.moveTo(-32, -22); ctx.lineTo(-8, -22); ctx.quadraticCurveTo(-18, 0, -30, 20); ctx.fill();
    ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; ctx.beginPath(); ctx.moveTo(32, -22); ctx.lineTo(20, -22); ctx.lineTo(30, -2); ctx.fill();
  });
  // The chimney, snapped off and lying on its side, still smoking
  const chx = c.x + 250, chy = top(c.x + 250) - 8;
  slab(chx, chy, 1.35, () => {
    ctx.fillStyle = '#57534E'; ctx.fillRect(-12, -40, 24, 44);
    ctx.fillStyle = '#44403C'; for (let y = -36; y < 4; y += 10) ctx.fillRect(-12, y, 24, 2);
  });
  for (let i = 0; i < 4; i++) {
    const k = ((state.frame * 0.4 + i * 25) % 100) / 100;
    ctx.fillStyle = `rgba(160, 160, 170, ${0.5 - k * 0.45})`;
    ctx.beginPath(); ctx.arc(chx - 44 - k * 10, chy - 10 - k * 60, 5 + k * 9, 0, Math.PI * 2); ctx.fill();
  }
  // RANGER STATION, bent over
  slab(c.x - 95, top(c.x - 95) + 6, -0.35, () => {
    ctx.fillStyle = '#3F2A1D'; ctx.fillRect(-3, -48, 6, 50);
    ctx.fillStyle = '#14532D'; ctx.fillRect(-45, -70, 90, 30);
    ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('RANGER', 0, -58); ctx.fillText('STATION', 0, -47); ctx.textAlign = 'left';
  });
  // The ranger: upside down, boots in the air, legs still twitching
  const rx = c.x - 5, ry = top(c.x - 5) + 4;
  const twitch = Math.floor(state.frame / 7) % 5 === 0 ? 0.25 : 0;
  for (const [dx, a] of [[-7, -0.12 - twitch], [7, 0.1 + twitch * 0.5]] as [number, number][]) {
    slab(rx + dx, ry, a, () => {
      ctx.fillStyle = '#4D5A2A'; ctx.fillRect(-5, -44, 10, 44);   // ranger-green trousers
      ctx.fillStyle = '#3F2A1D'; ctx.fillRect(-6, -54, 13, 11);   // boot
      ctx.fillStyle = '#1C1917'; ctx.fillRect(-6, -56, 13, 3);    // sole
    });
  }
  // His hat, blown clean off and landed on top
  const hx = ski.pileX - 150, hy = top(ski.pileX - 150) - 4;
  ctx.fillStyle = '#A16207'; ctx.beginPath(); ctx.ellipse(hx, hy, 20, 5, 0.15, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(hx - 10, hy - 12, 18, 12);
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
    ctx.fillStyle = '#FACC15'; ctx.fillRect(-34, -3, 70, 4);
    ctx.fillStyle = '#EAB308'; ctx.beginPath(); ctx.moveTo(36, -3); ctx.quadraticCurveTo(44, -4, 42, -10); ctx.lineTo(38, -9); ctx.lineTo(36, 1); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(-10, -5, 8, 3); ctx.fillRect(4, -5, 8, 3);
    ctx.restore();
  }
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
  const grad = ctx.createRadialGradient(-14, -14, 2, 0, 0, r);
  grad.addColorStop(0, '#FFFFFF'); grad.addColorStop(0.75, '#E2ECF7'); grad.addColorStop(1, '#A7BCD6');
  ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // Arms and legs sticking out, flailing
  ctx.fillStyle = '#E0AC69';
  for (let i = 0; i < 4; i++) {
    const a = i * (Math.PI / 2) + 0.4;
    ctx.save(); ctx.rotate(a); ctx.fillRect(r - 6, -5, 18, 10); ctx.fillStyle = i < 2 ? '#1E3A8A' : '#E0AC69'; ctx.fillRect(r + 10, -6, 8, 12); ctx.restore();
    ctx.fillStyle = '#E0AC69';
  }
  // His head, poking out
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(0, -r + 6, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#18181B'; ctx.fillRect(-10, -r - 6, 20, 5);
  ctx.fillStyle = '#FFF'; ctx.fillRect(-7, -r + 4, 5, 3); ctx.fillRect(2, -r + 4, 5, 3);
  ctx.fillStyle = '#111'; ctx.fillRect(-6, -r + 10, 12, 3);
  ctx.restore();
};

/** A wall of churning snow, taller than the screen, with trees and rocks tumbling in it. */
const drawAvalanche = (ctx: Ctx, state: GameState, ski: Ski) => {
  const front = ski.avX;
  const left = state.camera.x - 60;
  if (front < left) return;
  const f = state.frame;
  const topAt = (x: number) => groundAt(state, x) - 420 - Math.sin(x * 0.02 + f * 0.1) * 30;
  // Body
  const grad = ctx.createLinearGradient(0, state.camera.y, 0, state.camera.y + 600);
  grad.addColorStop(0, '#F8FAFC'); grad.addColorStop(1, '#C7D6EA');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(left, state.camera.y + 700);
  for (let x = left; x <= front; x += 30) ctx.lineTo(x, topAt(x));
  ctx.lineTo(front, groundAt(state, front));
  ctx.lineTo(front, state.camera.y + 700);
  ctx.closePath();
  ctx.fill();
  // Tumbling debris inside it
  for (let i = 0; i < 6; i++) {
    const dx = front - 60 - ((f * 3 + i * 97) % 500);
    if (dx < left) continue;
    const dy = groundAt(state, dx) - 60 - ((i * 71 + f * 2) % 280);
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(f * 0.1 + i);
    if (i % 2) { ctx.fillStyle = '#14532D'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-10, 12); ctx.lineTo(10, 12); ctx.fill(); ctx.fillStyle = '#3F2A1D'; ctx.fillRect(-2, 12, 4, 8); }
    else { ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.arc(0, 0, 10 + (i % 3) * 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // Billowing front edge
  for (let i = 0; i < 14; i++) {
    const y = groundAt(state, front) - i * 32;
    const bx = front + Math.sin(f * 0.2 + i * 1.3) * 12;
    const br = 30 + ((i * 17 + f) % 20);
    ctx.fillStyle = i % 2 ? '#FFFFFF' : '#E2ECF7';
    ctx.beginPath(); ctx.arc(bx, y, br, 0, Math.PI * 2); ctx.fill();
  }
  // Spray ahead of it
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 20; i++) {
    const sx = front + 10 + ((f * 7 + i * 41) % 140);
    const sy = groundAt(state, front) - ((i * 53 + f * 3) % 380);
    ctx.fillRect(sx, sy, 3 + (i % 3), 3 + (i % 3));
  }
};

/** How close it is. */
export const drawSkiHud = (ctx: Ctx, state: GameState, ski: Ski) => {
  if (ski.phase !== 'skiing') return;
  const gap = Math.max(0, state.player.pos.x - ski.avX);
  const k = Math.max(0, Math.min(1, 1 - gap / 800));
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(250, 14, 300, 28);
  ctx.fillStyle = '#1E293B'; ctx.fillRect(258, 32, 284, 6);
  ctx.fillStyle = k > 0.7 ? '#EF4444' : k > 0.4 ? '#F59E0B' : '#38BDF8';
  ctx.fillRect(258, 32, 284 * k, 6);
  ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#F8FAFC'; ctx.fillText('AVALANCHE', 400, 27);
  if (k > 0.7 && Math.floor(state.frame / 10) % 2 === 0) {
    ctx.font = 'bold 16px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText('GO GO GO', 402, 76);
    ctx.fillStyle = '#EF4444'; ctx.fillText('GO GO GO', 400, 74);
  }
  ctx.restore();
};
