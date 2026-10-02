// Draws the special kill animations (see game/enemies/deaths.ts).

import { drawDummy } from '../dummies';
import { drawFlameLicks } from '../fx/fireball';
import type { Enemy } from '../../../types';
import { GameState } from '../../core/state';
import { EnemyDeath, DEATH_FRAMES } from '../../enemies/deaths';
import { drawKindCorpse, KIND_HEAD, isHumanoidKind, skeletonOf } from './index';

type Ctx = CanvasRenderingContext2D;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Mix two #rrggbb colours. */
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp01(t))).join(',')})`;
};

/** Fade out over the last `n` frames. */
const fadeOut = (d: EnemyDeath, n: number) => clamp01((DEATH_FRAMES[d.kind] - d.t) / n);

export const drawEnemyDeaths = (ctx: Ctx, state: GameState) => {
  for (const d of state.enemyDeaths) {
    ctx.save();
    switch (d.kind) {
      case 'charred': drawCharred(ctx, d, state.frame, state); break;
      case 'fried': drawFried(ctx, d, state.frame, state); break;
      case 'melted': drawMelted(ctx, d, state.frame, state); break;
      case 'greased': drawGreased(ctx, d, state.frame, state); break;
      case 'pancaked': drawPancaked(ctx, d, state); break;
      case 'ceilinged': {
        // The pancake, upside down on the underside of the ceiling (its feet line is the ceiling), strands hanging off it
        const ceil = d.y + d.h;
        ctx.save(); ctx.translate(0, 2 * ceil); ctx.scale(1, -1); drawPancaked(ctx, d, state); ctx.restore();
        ctx.globalAlpha = fadeOut(d, 30);
        ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k < 3; k++) { const sx = d.x + d.w / 2 + (k - 1) * d.w * 0.5, len = 6 + ((d.t * (0.3 + k * 0.17)) % 14); ctx.moveTo(sx, ceil + 4); ctx.lineTo(sx, ceil + 4 + len); }
        ctx.stroke();
        break;
      }
      case 'headshot': drawHeadshot(ctx, d, state); break;
    }
    ctx.restore();
  }
};

/**
 * What died, drawn as itself: a themed enemy's own sprite (squashed, tinted or
 * clipped as the animation wants), anything else as its coloured block.
 * Scaling is about the middle of its feet.
 */
const drawBody = (ctx: Ctx, d: EnemyDeath, state: GameState, o: { filter?: string; sx?: number; sy?: number; clipFromY?: number } = {}) => {
  const { x, y, w, h } = d;
  ctx.save();
  if (o.clipFromY !== undefined) { ctx.beginPath(); ctx.rect(x - w, o.clipFromY, w * 3, y + h - o.clipFromY + 4); ctx.clip(); }
  const fx = x + w / 2, fy = y + h;
  ctx.translate(fx, fy); ctx.scale(o.sx ?? 1, o.sy ?? 1); ctx.translate(-fx, -fy);
  if (o.filter) ctx.filter = o.filter;
  if (d.dummy) drawDummy(ctx, { id: `dummy-${d.dummy}`, pos: { x, y }, width: w, height: h, vel: { x: d.sprite?.facing ?? 1, y: 0 } } as Enemy, 0);
  else if (d.sprite) drawKindCorpse(ctx, d.sprite.kind, x, y, w, h, d.sprite.facing, d.sprite.phase, state);
  else { ctx.fillStyle = d.color; ctx.fillRect(x, y, w, h); }
  ctx.restore();
};

/** Where its head is (from the middle of its feet): a themed enemy's own; the practice dummies' as they're drawn (the
 * boxer's up top of his tall frame, the balloon man's just over his little box: he's shorter than anybody). */
const headOf = (d: EnemyDeath) => d.dummy === 'air' ? { x: 0, y: -(d.h + 3), r: 7 } : d.dummy === 'ground' ? { x: 3, y: -66, r: 9 } : KIND_HEAD[d.sprite!.kind];

/** Where its eyes are (world coords): on a themed enemy's head, else near the top of the block. */
const eyesAt = (d: EnemyDeath, dy = 0) => {
  if (!d.sprite) return { x1: d.x + d.w * 0.3 - 3, x2: d.x + d.w * 0.62 - 2, y: d.y + Math.min(d.h * 0.3, 18) + dy };
  const head = headOf(d), cx = d.x + d.w / 2 + head.x * d.sprite.facing;
  return { x1: cx - 6, x2: cx + 2, y: d.y + d.h + head.y - 2 + dy };
};

/** Burns black in the flames, blinks its eyes once (classic cartoon), then crumbles to ash. */
const drawCharred = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h, t } = d;
  const crumble = clamp01((t - 55) / 25);
  const standingH = h * (1 - crumble);
  if (standingH > 1) {
    const burnt = clamp01(t / 18);
    if (d.sprite) drawBody(ctx, d, state, { filter: `brightness(${1 - burnt * 0.88}) saturate(${1 - burnt})`, clipFromY: y + h - standingH });
    else { ctx.fillStyle = mix(d.color, '#1C1917', burnt); ctx.fillRect(x, y + h - standingH, w, standingH); }
    // Glowing cracks
    if (t > 12) {
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.5 + 0.4 * Math.sin(frame * 0.4)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const cy = y + h - standingH + (i + 0.5) * standingH / 3;
        ctx.moveTo(x + 4, cy); ctx.lineTo(x + w * 0.4, cy + 4); ctx.lineTo(x + w * 0.6, cy - 3); ctx.lineTo(x + w - 4, cy + 2);
      }
      ctx.stroke();
    }
    // Two white eyes blinking in the soot
    if (t > 22 && t < 55 && !(t > 36 && t < 40)) {
      const e = eyesAt(d);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(e.x1, e.y, 5, 5);
      ctx.fillRect(e.x2, e.y, 5, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(e.x1 + 2, e.y + 2, 2, 2);
      ctx.fillRect(e.x2 + 2, e.y + 2, 2, 2);
    }
  }
  // Flames licking up while it burns
  if (t < 24) {
    // (up off the whole of it, dying down as it goes black)
    drawFlameLicks(ctx, x + w / 2, y + h * 0.7, w + 4, h * 0.75 + 12, frame, { seed: Math.floor(x), k: Math.min(1, (24 - t) / 8) });
  }
  // Ash pile
  if (crumble > 0) {
    ctx.globalAlpha = fadeOut(d, 20);
    ctx.fillStyle = '#57534E';
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h, w * 0.6 * crumble + 4, 10 * crumble + 2, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F97316';
    if (frame % 10 < 5) ctx.fillRect(x + w * 0.45, y + h - 4, 2, 2);
  }
};

/** Electrocuted: flashing between its body and an X-ray skeleton, then a smoking heap. */
const drawFried = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h, t } = d;
  if (t < 40) {
    ctx.translate((frame % 2 ? 2 : -2), (frame % 3 ? 1 : -1));
    const xray = frame % 6 < 3;
    if (d.sprite) {
      drawBody(ctx, d, state, xray ? { filter: 'brightness(0.45) sepia(1) hue-rotate(150deg) saturate(5)' } : {});
      if (xray) drawKindSkeleton(ctx, d);
    } else {
      ctx.fillStyle = xray ? '#0891B2' : d.color;
      ctx.fillRect(x, y, w, h);
    }
    if (xray && !d.sprite) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      const cx = x + w / 2;
      const skullR = Math.min(w, h) * 0.2;
      const top = y + skullR + 3;
      ctx.beginPath(); ctx.arc(cx, top, skullR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0891B2';
      ctx.fillRect(cx - skullR * 0.6, top - skullR * 0.2, skullR * 0.45, skullR * 0.45);
      ctx.fillRect(cx + skullR * 0.15, top - skullR * 0.2, skullR * 0.45, skullR * 0.45);
      const spineTop = top + skullR, hip = y + h * 0.68;
      ctx.beginPath();
      ctx.moveTo(cx, spineTop); ctx.lineTo(cx, hip);
      for (let i = 0; i < 3; i++) { const ry = spineTop + 5 + i * (hip - spineTop - 6) / 3; ctx.moveTo(cx - w * 0.28, ry); ctx.lineTo(cx + w * 0.28, ry); }
      ctx.moveTo(cx - w * 0.2, hip); ctx.lineTo(cx + w * 0.2, hip);
      ctx.moveTo(cx - w * 0.15, hip); ctx.lineTo(cx - w * 0.22, y + h - 2);
      ctx.moveTo(cx + w * 0.15, hip); ctx.lineTo(cx + w * 0.22, y + h - 2);
      ctx.moveTo(cx - w * 0.28, spineTop + 4); ctx.lineTo(cx - w * 0.45, spineTop + 16);
      ctx.moveTo(cx + w * 0.28, spineTop + 4); ctx.lineTo(cx + w * 0.45, spineTop + 16);
      ctx.stroke();
    }
    // Arcs of electricity crawling over it
    ctx.strokeStyle = '#E0FFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      let px = x + ((frame * 7 + i * 13) % w), py = y;
      ctx.moveTo(px, py);
      for (let k = 0; k < 4; k++) { px += ((frame + i + k) % 2 ? 6 : -6); py += h / 4; ctx.lineTo(px, py); }
    }
    ctx.stroke();
    return;
  }
  // Keeled over, cooked black and smoking: a person flat on their back, an animal legs-up
  if (d.sprite) {
    ctx.globalAlpha = fadeOut(d, 15);
    const k = clamp01((t - 40) / 6);
    const humanoid = isHumanoidKind(d.sprite.kind);
    const fx = x + w / 2, fy = y + h;
    ctx.save();
    if (humanoid) {
      // Toppled backwards about the heels
      ctx.translate(fx, fy - 2); ctx.rotate(-d.sprite.facing * (Math.PI / 2) * k); ctx.translate(-fx, -(fy - 2));
    } else {
      // Rolled over: flipped upside down, lying on its back
      ctx.translate(fx, fy - h / 2); ctx.scale(1, 1 - 2 * k); ctx.translate(-fx, -(fy - h / 2));
    }
    drawBody(ctx, d, state, { filter: 'brightness(0.18) saturate(0)' });
    ctx.restore();
    return;
  }
  // Collapsed into a smoking black heap
  const k = clamp01((t - 40) / 8);
  const heapH = h * (1 - k) + 12 * k;
  ctx.globalAlpha = fadeOut(d, 15);
  ctx.fillStyle = mix(d.color, '#1C1917', 0.9);
  ctx.beginPath(); ctx.roundRect(x - 4 * k, y + h - heapH, w + 8 * k, heapH, 4 * k); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + w * 0.35, y + h - heapH + 3, 3, 3);
  ctx.fillRect(x + w * 0.55, y + h - heapH + 3, 3, 3);
};

/** A themed enemy's skeleton, glowing white through the x-ray flash: four-legged, bird or human. */
const drawKindSkeleton = (ctx: Ctx, d: EnemyDeath) => {
  const s = d.sprite!;
  const head = headOf(d);
  ctx.save();
  ctx.translate(d.x + d.w / 2, d.y + d.h);
  ctx.scale(s.facing, 1);
  ctx.strokeStyle = '#FFFFFF'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  const w = d.w, h = d.h;
  const bones = skeletonOf(s.kind);
  // Skull, with dark sockets (a machine's got no skull: its circuit board lights up instead)
  if (bones !== 'machine') {
    ctx.beginPath(); ctx.arc(head.x, head.y, head.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0E7490';
    ctx.fillRect(head.x + head.r * 0.1, head.y - head.r * 0.35, head.r * 0.45, head.r * 0.45);
    ctx.fillRect(head.x - head.r * 0.6, head.y - head.r * 0.35, head.r * 0.45, head.r * 0.45);
  }
  ctx.beginPath();
  if (bones === 'machine') {
    // The board, its traces and chips, wires out to the motors
    const cy = -h * 0.55;
    ctx.rect(-w * 0.22, cy - h * 0.2, w * 0.44, h * 0.4);
    for (let i = 0; i < 3; i++) { ctx.moveTo(-w * 0.18, cy - h * 0.1 + i * h * 0.1); ctx.lineTo(w * 0.18, cy - h * 0.1 + i * h * 0.1); }
    for (const sx of [-1, 1]) { ctx.moveTo(sx * w * 0.22, cy); ctx.lineTo(sx * w * 0.42, cy - h * 0.25); ctx.moveTo(sx * w * 0.42 + 5, cy - h * 0.25); ctx.arc(sx * w * 0.42, cy - h * 0.25, 5, 0, Math.PI * 2); }
    ctx.fillRect(-4, cy - 3, 8, 6);
  } else if (bones === 'four-legs') {
    // Four legs, a spine along the back, ribs hanging off it, a tail
    const back = -h * 0.62, hipX = -w * 0.38, shoulderX = w * 0.25;
    ctx.moveTo(hipX - 8, back + 2); ctx.lineTo(shoulderX, back); ctx.lineTo(head.x - head.r * 0.8, head.y + 2);
    for (let i = 0; i < 4; i++) { const rx = hipX + 10 + i * (shoulderX - hipX - 10) / 4; ctx.moveTo(rx, back); ctx.lineTo(rx + 1, back + h * 0.28); }
    for (const lx of [hipX, hipX + 8, shoulderX - 6, shoulderX]) { ctx.moveTo(lx, back); ctx.lineTo(lx + 2, -h * 0.25); ctx.lineTo(lx - 1, -1); }
    ctx.moveTo(hipX - 8, back + 2); ctx.lineTo(hipX - 20, back - (s.kind === 'goat' ? 6 : -4));
    if (s.kind === 'goat') { ctx.moveTo(head.x - 2, head.y - head.r); ctx.quadraticCurveTo(head.x - 12, head.y - head.r - 12, head.x - 16, head.y - 2); }
  } else if (bones === 'fish') {
    // A long spine, rib bones fanning off it, a forked tail
    const cy = -h * 0.5;
    ctx.moveTo(head.x - head.r, head.y + 2); ctx.lineTo(-w * 0.45, cy);
    for (let i = 0; i < 6; i++) { const rx = -w * 0.35 + i * w * 0.1; ctx.moveTo(rx, cy); ctx.lineTo(rx + 3, cy - h * 0.3); ctx.moveTo(rx, cy); ctx.lineTo(rx + 3, cy + h * 0.3); }
    ctx.moveTo(-w * 0.45, cy); ctx.lineTo(-w * 0.62, cy - h * 0.4); ctx.moveTo(-w * 0.45, cy); ctx.lineTo(-w * 0.62, cy + h * 0.4);
  } else if (bones === 'crab') {
    // A crab's all shell: glow the shell's outline, legs and claws instead
    ctx.ellipse(0, -h * 0.5, w * 0.35, h * 0.3, 0, 0, Math.PI * 2);
    for (const sx of [-1, 1]) { for (let i = 0; i < 3; i++) { ctx.moveTo(sx * w * 0.2, -h * 0.45); ctx.lineTo(sx * (w * 0.4 + i * 2), -1); } ctx.moveTo(sx * w * 0.3, -h * 0.6); ctx.lineTo(sx * w * 0.35, -h); }
  } else if (bones === 'bird') {
    // Wings spread wide, a short spine, a fan of tail bones, hooked beak
    const cy = -h * 0.5;
    ctx.moveTo(head.x - head.r, head.y + 2); ctx.lineTo(-w * 0.35, cy);
    ctx.moveTo(0, cy); ctx.lineTo(-w * 0.2, cy - h * 0.9); ctx.lineTo(-w * 0.55, cy - h * 1.1);
    ctx.moveTo(0, cy); ctx.lineTo(-w * 0.15, cy + h * 0.5);
    for (const a of [-0.3, 0, 0.3]) { ctx.moveTo(-w * 0.35, cy); ctx.lineTo(-w * 0.35 - Math.cos(a) * 12, cy + Math.sin(a) * 12); }
    ctx.moveTo(head.x + head.r, head.y); ctx.lineTo(head.x + head.r + 6, head.y + 4);
  } else {
    // A person: spine, ribs, pelvis, arms, legs
    const neck = head.y + head.r, hip = -h * 0.32;
    ctx.moveTo(0, neck); ctx.lineTo(0, hip);
    for (let i = 0; i < 3; i++) { const ry = neck + 5 + i * (hip - neck - 6) / 3; ctx.moveTo(-w * 0.28, ry); ctx.lineTo(w * 0.28, ry); }
    ctx.moveTo(-w * 0.2, hip); ctx.lineTo(w * 0.2, hip);
    ctx.moveTo(-w * 0.15, hip); ctx.lineTo(-w * 0.2, -2);
    ctx.moveTo(w * 0.15, hip); ctx.lineTo(w * 0.2, -2);
    ctx.moveTo(-w * 0.28, neck + 4); ctx.lineTo(-w * 0.45, neck + 22);
    ctx.moveTo(w * 0.28, neck + 4); ctx.lineTo(w * 0.5, neck + 18);
  }
  ctx.stroke();
  ctx.restore();
};

/** Slumps down into a bubbling green puddle, its eyes the last thing to sink. */
const drawMelted = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h, t } = d;
  const p = clamp01(t / 60);
  const bodyH = Math.max(6, h * (1 - p));
  const bodyW = w * (1 + p * 0.9);
  const bx = x + w / 2 - bodyW / 2, by = y + h - bodyH;
  ctx.globalAlpha = fadeOut(d, 25);
  // Puddle spreading underneath
  ctx.fillStyle = '#4D7C0F';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 2, bodyW * 0.7 + 6, 5 + p * 4, 0, 0, Math.PI * 2); ctx.fill();
  // The slumping body, going green
  if (d.sprite) drawBody(ctx, d, state, { sx: bodyW / w, sy: bodyH / h, filter: `grayscale(${Math.min(1, p * 2)}) sepia(${Math.min(1, p * 2)}) hue-rotate(${50 * p}deg) saturate(${1 + p * 4})` });
  else {
    ctx.fillStyle = mix(d.color, '#65A30D', p * 1.3);
    ctx.beginPath(); ctx.roundRect(bx, by, bodyW, bodyH, [Math.min(12, bodyH / 2) * p + 2, Math.min(12, bodyH / 2) * p + 2, 2, 2]); ctx.fill();
  }
  // Drips running down it
  ctx.fillStyle = '#84CC16';
  for (let i = 0; i < 4; i++) {
    const dx = bx + (i + 0.5) * bodyW / 4;
    const len = ((t * 1.5 + i * 9) % Math.max(8, bodyH));
    ctx.fillRect(dx - 1.5, by, 3, len);
    ctx.beginPath(); ctx.arc(dx, by + len, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  // Bubbles popping on top
  for (let i = 0; i < 3; i++) {
    const r = ((frame + i * 11) % 14) / 3;
    ctx.strokeStyle = '#D9F99D';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx + (i + 1) * bodyW / 4, by + 2, r, 0, Math.PI * 2); ctx.stroke();
  }
  // Eyes sinking into the goo
  if (t < 85) {
    const ey = d.sprite ? Math.max(by + 2, eyesAt(d).y * (1 - p) + (y + h - 6) * p) : by + Math.min(bodyH * 0.35, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(x + w / 2 - 6, ey, 3.5, 0, Math.PI * 2); ctx.arc(x + w / 2 + 6, ey + 1, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + w / 2 - 7, ey, 2, 2);
    ctx.fillRect(x + w / 2 + 5, ey + 1, 2, 2);
  }
};

/** Flung off black and glistening, then splatted flat in its own oil slick. */
const drawGreased = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h } = d;
  if (!d.landed) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(d.rot);
    ctx.translate(-(x + w / 2), -(y + h / 2));
    if (d.sprite) drawBody(ctx, d, state, { filter: 'brightness(0.14) contrast(1.4)' });
    else { ctx.fillStyle = '#0A0A0A'; ctx.fillRect(x, y, w, h); }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(x + 4, y + 3, 4, h - 6);
    return;
  }
  ctx.globalAlpha = fadeOut(d, 40);
  const cx = x + w / 2, fy = d.floorY;
  // The slick
  ctx.fillStyle = '#111111';
  ctx.beginPath(); ctx.ellipse(cx, fy - 2, w * 1.1, 7, 0, 0, Math.PI * 2); ctx.fill();
  // The body in a flattened heap in it
  ctx.fillStyle = '#1C1917';
  ctx.beginPath(); ctx.roundRect(cx - w * 0.6, fy - 14, w * 1.2, 13, [8, 8, 2, 2]); ctx.fill();
  // Greasy rainbow sheen
  const shine = (frame * 0.8) % (w * 1.2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(cx - w * 0.6 + shine, fy - 12, 5, 9);
  ctx.fillStyle = 'rgba(147, 51, 234, 0.35)';
  ctx.beginPath(); ctx.ellipse(cx + w * 0.4, fy - 2, 9, 2.5, 0, 0, Math.PI * 2); ctx.fill();
};

/** Flattened like a pancake on the floor, gore squeezed out the sides. */
const drawPancaked = (ctx: Ctx, d: EnemyDeath, state: GameState) => {
  const { x, y, w, h } = d;
  ctx.globalAlpha = fadeOut(d, 30);
  const cx = x + w / 2, fy = y + h;
  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath(); ctx.ellipse(cx, fy - 2, w * 1.05, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#B91C1C';
  ctx.beginPath(); ctx.ellipse(cx - w * 0.7, fy - 2, 6, 3, 0, 0, Math.PI * 2); ctx.ellipse(cx + w * 0.75, fy - 2, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  if (d.sprite) drawBody(ctx, d, state, { sx: 1.5, sy: 7 / h });
  else {
    ctx.fillStyle = d.color;
    ctx.fillRect(cx - w * 0.75, fy - 7, w * 1.5, 6);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(cx - w * 0.75, fy - 3, w * 1.5, 2);
  // X'd-out eyes
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const ex of [cx - 6, cx + 4]) { ctx.moveTo(ex - 2, fy - 6); ctx.lineTo(ex + 2, fy - 3); ctx.moveTo(ex + 2, fy - 6); ctx.lineTo(ex - 2, fy - 3); }
  ctx.stroke();
};

/**
 * The sniper's round: the head comes off whole and goes spinning away, bouncing; the body stays stood there a moment,
 * the neck going like a fountain, then goes over (a person back on its heels, an animal flat on its side).
 */
const drawHeadshot = (ctx: Ctx, d: EnemyDeath, state: GameState) => {
  const hd = d.head;
  if (!hd) return;
  const { x, y, w, h, t } = d;
  ctx.globalAlpha = fadeOut(d, 20);
  const neckY = y + hd.oy + hd.r * 0.7;
  // The body, from the neck down: stood there, then over
  const k = clamp01((t - 46) / 10);
  const facing = d.sprite?.facing ?? 1;
  const fx = x + w / 2, fy = y + h;
  ctx.save();
  if (!d.sprite || isHumanoidKind(d.sprite.kind)) { ctx.translate(fx, fy - 2); ctx.rotate(-facing * (Math.PI / 2) * k); ctx.translate(-fx, -(fy - 2)); }
  else { ctx.translate(fx, fy); ctx.scale(1, 1 - 0.45 * k); ctx.translate(-fx, -fy); }
  drawBody(ctx, d, state, { clipFromY: neckY });
  // The stump
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(x + hd.ox, neckY + 1, Math.max(3, hd.r * 0.7), 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(x + hd.ox, neckY, Math.max(2, hd.r * 0.45), 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // The head, wherever it's got to: the body's own drawing, cut round the head and carried off
  const cx = x + hd.ox, cy = y + hd.oy;
  ctx.save();
  ctx.translate(hd.x, hd.y); ctx.rotate(hd.rot); ctx.translate(-cx, -cy);
  ctx.beginPath(); ctx.rect(cx - hd.r * 1.6, cy - hd.r * 1.8, hd.r * 3.2, hd.r * 1.8 + hd.r * 0.7); ctx.clip();
  if (d.sprite) drawBody(ctx, d, state);
  else { ctx.fillStyle = d.color; ctx.fillRect(cx - hd.r, cy - hd.r, hd.r * 2, hd.r * 1.7); }
  // (and what's showing where it came off)
  ctx.fillStyle = '#991B1B'; ctx.fillRect(cx - hd.r * 0.6, cy + hd.r * 0.45, hd.r * 1.2, hd.r * 0.25);
  ctx.restore();
};
