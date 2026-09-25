// What's left of a boss killed with his weakness, left lying in the arena.
// Each is the boss's real sprite, wrecked in the way that weapon would:
// burned, melted, turned to stone, shattered, flattened, dissolved, overdosed,
// drowned in oil, or fried.

import { WeaponType } from '../../types';
import { BossCorpse } from '../state';
import { drawBoss, makeSitter } from './bosses';
import { drawRock, PLAYER_ROCK } from './boulders';

type Style = 'charred' | 'melted' | 'stone' | 'shattered' | 'flattened' | 'dissolved' | 'overdosed' | 'oiled' | 'fried';

const styleFor = (stageId: string, weapon: WeaponType): Style => {
  switch (weapon) {
    case 'FLAMETHROWER': return stageId === 'Artie Avalanche' ? 'melted' : 'charred';
    case 'TSUNAMI': return 'stone';
    case 'SHOTGUN': return 'shattered';
    case 'BOULDER': return 'flattened';
    case 'SLUDGE': return 'dissolved';
    case 'NEEDLES': return 'overdosed';
    case 'OIL_ROCKET': return 'oiled';
    case 'TASER': return 'fried';
    default: return 'charred';
  }
};

const S = 80; // boss sprite size

/** The boss's sprite, frozen in his final pose, in a local frame where (0,0) is its top-left. */
const sprite = (ctx: CanvasRenderingContext2D, c: BossCorpse) => drawBoss(ctx, makeSitter(c.stageId), c.stageId, c.frame0);

export const drawBossCorpse = (ctx: CanvasRenderingContext2D, c: BossCorpse, frame: number) => {
  const style = styleFor(c.stageId, c.weapon);
  const { x, y: floor } = c;
  const age = frame - c.frame0;
  ctx.save();
  switch (style) {
    case 'melted': {
      // A slumped heap sinking into a puddle of meltwater
      puddle(ctx, x, floor, 70, 'rgba(120, 200, 235, 0.75)', 'rgba(220, 245, 255, 0.8)');
      const sink = Math.min(1, age / 90);
      const squash = 0.65 - 0.2 * sink;
      // Slushy mound he's collapsing into
      ctx.fillStyle = 'rgba(200, 238, 255, 0.9)';
      ctx.beginPath();
      ctx.ellipse(x, floor - 4, S * 0.75, S * squash * 0.35, 0, Math.PI, 0);
      ctx.fill();
      ctx.save();
      ctx.translate(x - S * 0.6, floor - S * squash);
      ctx.scale(1.2, squash);
      ctx.filter = 'saturate(0.6) brightness(1.15)';
      sprite(ctx, c);
      ctx.restore();
      drips(ctx, x, floor, frame, 'rgba(180, 230, 255, 0.9)');
      steam(ctx, x, floor - 30, frame, 'rgba(230, 245, 255, 0.35)');
      break;
    }
    case 'stone': {
      // Doused magma: a cracked grey statue, still steaming, in a puddle
      puddle(ctx, x, floor, 60, 'rgba(60, 110, 160, 0.55)', 'rgba(170, 210, 240, 0.6)');
      ctx.save();
      // Slumped and cracked, with a chunk broken off
      ctx.translate(x, floor);
      ctx.rotate(-0.18 * c.facing);
      ctx.translate(-S / 2, -S);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(S, 0); ctx.lineTo(S, S * 0.45); ctx.lineTo(S * 0.78, S * 0.55); ctx.lineTo(S * 0.9, S); ctx.lineTo(0, S);
      ctx.closePath();
      ctx.clip();
      ctx.filter = 'grayscale(1) brightness(0.6) contrast(1.3)';
      sprite(ctx, c);
      ctx.filter = 'none';
      cracks(ctx, '#1B1B1B', 7);
      ctx.restore();
      // The broken-off chunk on the floor
      ctx.fillStyle = '#5A5A5A';
      ctx.strokeStyle = '#1B1B1B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + c.facing * 48, floor); ctx.lineTo(x + c.facing * 56, floor - 14); ctx.lineTo(x + c.facing * 70, floor - 10); ctx.lineTo(x + c.facing * 72, floor);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      steam(ctx, x, floor - S, frame, 'rgba(240, 240, 240, 0.4)');
      break;
    }
    case 'shattered': {
      // Frozen solid and smashed: chunks of him scattered across the floor
      bloodPool(ctx, x, floor, 55);
      const chunks: [number, number, number, number, number, number][] = [
        // clip rect in sprite space (sx, sy, sw, sh), landing offset x, spin
        [0, 0, 40, 40, -60, -0.6], [40, 0, 40, 40, 30, 0.9], [0, 40, 40, 40, -15, 1.7], [40, 40, 40, 40, 70, -1.2],
      ];
      for (const [sx, sy, sw, sh, dx, spin] of chunks) {
        ctx.save();
        ctx.translate(x + dx, floor - sh / 2 - 2);
        ctx.rotate(spin);
        ctx.beginPath();
        // Jagged break edges
        ctx.moveTo(-sw / 2, -sh / 2 + 4); ctx.lineTo(-sw / 6, -sh / 2); ctx.lineTo(sw / 2, -sh / 2 + 6);
        ctx.lineTo(sw / 2 - 3, sh / 2); ctx.lineTo(-sw / 3, sh / 2 - 3); ctx.lineTo(-sw / 2, sh / 6);
        ctx.closePath();
        ctx.save();
        ctx.clip();
        ctx.translate(-sx - sw / 2, -sy - sh / 2);
        sprite(ctx, c);
        ctx.restore();
        ctx.fillStyle = 'rgba(170, 230, 255, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#E0F7FA';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      frost(ctx, x, floor, frame);
      break;
    }
    case 'flattened': {
      // Squashed flat under a boulder, burst out both ends
      bloodPool(ctx, x, floor, 90);
      ctx.save();
      ctx.translate(x - S * 0.8, floor - S * 0.2);
      ctx.scale(1.6, 0.2);
      sprite(ctx, c);
      ctx.restore();
      drawRock(ctx, x + 6, floor - 36 - 12, 36, 0.4, PLAYER_ROCK, 11);
      gore(ctx, x, floor, 8, 70);
      break;
    }
    case 'dissolved': {
      // Half sunk into a bubbling pool of barf, bones poking out
      ctx.save();
      // Only his top half is left above the surface
      ctx.beginPath();
      ctx.rect(x - S, floor - S * 1.5, S * 2, S * 1.5 - 4);
      ctx.clip();
      ctx.translate(x - S / 2, floor - S * 0.55);
      ctx.filter = 'sepia(0.6) hue-rotate(40deg) saturate(1.4)';
      sprite(ctx, c);
      ctx.restore();
      bones(ctx, x, floor);
      puddle(ctx, x, floor, 85, 'rgba(46, 125, 50, 0.9)', 'rgba(173, 255, 47, 0.7)');
      bubbles(ctx, x, floor, frame, '#ADFF2F');
      break;
    }
    case 'overdosed': {
      // Keeled over, foaming at the mouth, still twitching, syringes sticking out of him
      bloodPool(ctx, x, floor, 40);
      const twitch = (frame % 50) < 4 ? Math.sin(frame * 3) * 2 : 0;
      lying(ctx, c, x, floor, frame, `hue-rotate(${(frame * 6) % 360}deg) saturate(1.6)`, twitch);
      syringes(ctx, x, floor);
      foam(ctx, x + c.facing * 38, floor - 30, frame);
      break;
    }
    case 'oiled': {
      // Face-down in a black slick, glistening with crude
      const bob = Math.sin(frame * 0.05) * 2;
      lying(ctx, c, x, floor + 12 + bob, frame, 'brightness(0.45) contrast(1.3)', 0);
      // Coated in globs of crude with a rainbow sheen
      ctx.fillStyle = 'rgba(8, 6, 10, 0.85)';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.ellipse(x - 34 + i * 11, floor - 18 + bob + Math.sin(i * 2.3) * 14, 10 + (i % 3) * 3, 7 + (i % 2) * 3, i, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = `hsla(${(frame * 3) % 360}, 80%, 60%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 30, floor - 30 + bob); ctx.quadraticCurveTo(x, floor - 38 + bob, x + 28, floor - 26 + bob);
      ctx.stroke();
      puddle(ctx, x, floor + 22, 90, 'rgba(10, 8, 12, 0.9)', `hsla(${(frame * 3) % 360}, 80%, 60%, 0.6)`);
      drips(ctx, x, floor, frame, '#050505');
      break;
    }
    case 'fried': {
      // Electrocuted to a smoking husk, sparks still crackling
      bloodPool(ctx, x, floor, 40);
      lying(ctx, c, x, floor, frame, 'grayscale(1) brightness(0.25) contrast(1.6)', 0);
      smoke(ctx, x, floor - 30, frame);
      if (frame % 20 < 6) sparks(ctx, x, floor - 25, frame);
      break;
    }
    default: {
      // Burned to a crisp
      bloodPool(ctx, x, floor, 45);
      lying(ctx, c, x, floor, frame, 'sepia(1) brightness(0.3) contrast(1.5)', 0);
      embers(ctx, x, floor - 20, frame);
      smoke(ctx, x, floor - 30, frame);
    }
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

/** The sprite keeled over on its side. */
const lying = (ctx: CanvasRenderingContext2D, c: BossCorpse, x: number, floor: number, frame: number, filter: string, jitter: number) => {
  ctx.save();
  ctx.translate(x + jitter, floor - S / 2 + 6);
  ctx.rotate(c.facing * Math.PI / 2);
  ctx.translate(-S / 2, -S / 2);
  ctx.filter = filter;
  sprite(ctx, c);
  ctx.restore();
};

const puddle = (ctx: CanvasRenderingContext2D, x: number, floor: number, w: number, fill: string, shine: string) => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, floor - 2, w, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(x - w * 0.6, floor - 1, w * 0.35, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.7, floor - 1, w * 0.3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.ellipse(x - w * 0.2, floor - 5, w * 0.35, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
};

const bloodPool = (ctx: CanvasRenderingContext2D, x: number, floor: number, w: number) => {
  puddle(ctx, x, floor, w, 'rgba(110, 0, 0, 0.9)', 'rgba(255, 120, 120, 0.35)');
  gore(ctx, x, floor, 5, w);
};

/** Chunks of meat lying around. */
const gore = (ctx: CanvasRenderingContext2D, x: number, floor: number, count: number, spread: number) => {
  const colors = ['#8B0000', '#B22222', '#FF8A80', '#5A0000'];
  for (let i = 0; i < count; i++) {
    const gx = x + Math.sin(i * 7.3) * spread, r = 3 + (i % 3) * 2;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.ellipse(gx, floor - r * 0.6, r * 1.3, r * 0.8, i, 0, Math.PI * 2);
    ctx.fill();
  }
};

const steam = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, color: string) => {
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i++) {
    const t = ((frame * 0.7 + i * 25) % 100) / 100;
    ctx.globalAlpha = 1 - t;
    ctx.beginPath();
    ctx.arc(x - 20 + i * 14 + Math.sin(t * 5 + i) * 6, y - t * 70, 6 + t * 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

const smoke = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => steam(ctx, x, y, frame, 'rgba(40, 40, 40, 0.55)');

const embers = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = (frame + i * 7) % 20 < 10 ? '#FF6D00' : '#FFB300';
    ctx.beginPath();
    ctx.arc(x - 30 + i * 12, y + Math.sin(i * 2.1) * 10, 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

const sparks = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.strokeStyle = '#80DEEA';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 8;
  for (let k = 0; k < 3; k++) {
    let px = x - 30 + k * 30, py = y;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 4; s++) { px += Math.sin(frame + k * 5 + s) * 8; py -= 6; ctx.lineTo(px, py); }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const drips = (ctx: CanvasRenderingContext2D, x: number, floor: number, frame: number, color: string) => {
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const t = ((frame * 0.8 + i * 17) % 40) / 40;
    ctx.beginPath();
    ctx.ellipse(x - 30 + i * 30, floor - 30 + t * 26, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

const cracks = (ctx: CanvasRenderingContext2D, color: string, seed: number) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let k = 0; k < 4; k++) {
    let px = 10 + ((seed * (k + 3)) % 60), py = 5 + k * 18;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 3; s++) { px += ((seed + k + s) % 2 === 0 ? 8 : -6); py += 7; ctx.lineTo(px, py); }
    ctx.stroke();
  }
};

const frost = (ctx: CanvasRenderingContext2D, x: number, floor: number, frame: number) => {
  ctx.fillStyle = 'rgba(230, 250, 255, 0.85)';
  for (let i = 0; i < 10; i++) {
    const fx = x - 90 + i * 19, glint = (frame + i * 9) % 40 < 3;
    ctx.fillRect(fx, floor - 3 - (i % 3) * 2, glint ? 4 : 3, glint ? 4 : 3);
  }
};

const bones = (ctx: CanvasRenderingContext2D, x: number, floor: number) => {
  ctx.fillStyle = '#F5F5DC';
  ctx.strokeStyle = '#8D8D6E';
  ctx.lineWidth = 1;
  for (const [bx, rot] of [[-45, -0.4], [40, 0.5], [10, -0.1]]) {
    ctx.save();
    ctx.translate(x + bx, floor - 8);
    ctx.rotate(rot);
    ctx.fillRect(-12, -2, 24, 4);
    for (const ex of [-12, 12]) {
      ctx.beginPath();
      ctx.arc(ex, -2, 3, 0, Math.PI * 2);
      ctx.arc(ex, 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
};

const bubbles = (ctx: CanvasRenderingContext2D, x: number, floor: number, frame: number, color: string) => {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const b = Math.sin(frame * 0.2 + i * 1.9);
    if (b < 0.3) continue;
    ctx.beginPath();
    ctx.arc(x - 60 + i * 30, floor - 6 - b * 4, 2 + b * 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

const syringes = (ctx: CanvasRenderingContext2D, x: number, floor: number) => {
  for (const [sx, sy, rot] of [[-20, -50, -0.8], [5, -45, -1.3], [25, -35, -0.5]]) {
    ctx.save();
    ctx.translate(x + sx, floor + sy);
    ctx.rotate(rot);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(-14, -3, 12, 6);
    ctx.fillStyle = '#FF2BD6';
    ctx.fillRect(-13, -2, 9, 4);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(6, 0); ctx.stroke();
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-18, -3, 2, 6);
    ctx.restore();
  }
};

const foam = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(x + Math.sin(i * 2 + frame * 0.1) * 6, y + i * 4 + Math.cos(frame * 0.15 + i) * 2, 3 + (i % 2) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
};
