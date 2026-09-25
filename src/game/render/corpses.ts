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
      puddle(ctx, x, floor, 80, 'rgba(150, 70, 100, 0.7)', 'rgba(255, 170, 190, 0.6)');
      bloodSwirls(ctx, x, floor, 70);
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
      // What the ice was holding in: organs showing through the slush
      organs(ctx, x - 6, floor - 14, 0.8);
      boneStump(ctx, x - 40, floor - 8, -2.4, 26);
      boneStump(ctx, x + 38, floor - 6, -0.7, 22);
      eyeball(ctx, x + 58, floor - 5, 5, -1);
      drips(ctx, x, floor, frame, 'rgba(200, 60, 80, 0.9)');
      steam(ctx, x, floor - 30, frame, 'rgba(230, 245, 255, 0.35)');
      flies(ctx, x, floor - 30, frame, age, 3);
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
      // Where the chunk broke off: raw meat inside the stone
      rawWound(ctx, S * 0.88, S * 0.62, 14, 20, frame);
      bleedFromCracks(ctx, frame);
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
      meatSection(ctx, x + c.facing * 60, floor - 6, 7);
      bloodPool(ctx, x, floor, 50);
      steam(ctx, x, floor - S, frame, 'rgba(240, 240, 240, 0.4)');
      flies(ctx, x, floor - 50, frame, age, 2);
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
        ctx.fillStyle = 'rgba(170, 230, 255, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#E0F7FA';
        ctx.lineWidth = 2;
        ctx.stroke();
        // The broken face: frozen marbled meat and a snapped bone
        ctx.save();
        ctx.clip();
        meatSection(ctx, sw / 2 - 6, 0, sh * 0.45);
        ctx.restore();
        ctx.restore();
      }
      guts(ctx, x - 10, floor - 4, 1, 60, frame);
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
      guts(ctx, x - 50, floor - 3, -1, 70, frame);
      guts(ctx, x + 55, floor - 3, 1, 55, frame);
      drawRock(ctx, x + 6, floor - 36 - 12, 36, 0.4, PLAYER_ROCK, 11);
      bloodSpray(ctx, x, floor, frame);
      boneStump(ctx, x - 30, floor - 6, -2.8, 30);
      eyeball(ctx, x + 95, floor - 5, 6, 1);
      gore(ctx, x, floor, 10, 90);
      flies(ctx, x, floor - 40, frame, age, 4);
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
      ctx.filter = 'none';
      // Half his face melted off: skull showing, flesh hanging in strings
      halfSkull(ctx, S * 0.5, S * 0.05, frame);
      ctx.restore();
      bones(ctx, x, floor);
      eyeball(ctx, x - 55, floor - 6, 5, 1);
      bloodSwirls(ctx, x, floor, 80);
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
      bloodStreams(ctx, x + c.facing * 30, floor - 40, frame);
      bloodPool(ctx, x + c.facing * 30, floor, 35);
      flies(ctx, x, floor - 45, frame, age, 4);
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
      rawWound(ctx, x + 4, floor - 22 + bob, 16, 12, frame);
      guts(ctx, x + 10, floor - 14 + bob, 1, 55, frame);
      guts(ctx, x - 5, floor - 12 + bob, -1, 40, frame);
      puddle(ctx, x, floor + 22, 90, 'rgba(10, 8, 12, 0.9)', `hsla(${(frame * 3) % 360}, 80%, 60%, 0.6)`);
      drips(ctx, x, floor, frame, '#050505');
      flies(ctx, x, floor - 45, frame, age, 3);
      break;
    }
    case 'fried': {
      // Electrocuted to a smoking husk, sparks still crackling
      bloodPool(ctx, x, floor, 40);
      lying(ctx, c, x, floor, frame, 'grayscale(1) brightness(0.25) contrast(1.6)', 0);
      charredSplits(ctx, x, floor - 34, frame);
      ribs(ctx, x - 4, floor - 40);
      eyeball(ctx, x + c.facing * 44, floor - 5, 5, c.facing, true);
      smoke(ctx, x, floor - 30, frame);
      if (frame % 20 < 6) sparks(ctx, x, floor - 25, frame);
      flies(ctx, x, floor - 50, frame, age, 3);
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

// ---------------------------------------------------------------------------
// Gore
// ---------------------------------------------------------------------------

/** A loop of intestine spilling out along the floor in direction `dir`. */
const guts = (ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, len: number, frame: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push([x + dir * t * len, y - Math.abs(Math.sin(t * Math.PI * 2.5)) * 10 + Math.sin(frame * 0.05 + i) * 0.8]);
  }
  const trace = () => { ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); };
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#6E1B2B';
  ctx.lineWidth = 9;
  trace(); ctx.stroke();
  ctx.strokeStyle = '#C9566E';
  ctx.lineWidth = 6.5;
  trace(); ctx.stroke();
  // Sausage-like bulges and a wet shine
  for (let i = 1; i < pts.length; i += 2) {
    ctx.fillStyle = '#D9738A';
    ctx.beginPath();
    ctx.arc(pts[i][0], pts[i][1], 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255, 220, 230, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py - 2) : ctx.moveTo(px, py - 2)));
  ctx.stroke();
};

/** A snapped bone sticking out of a ring of torn meat. */
const boneStump = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, len: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#EFE6CF';
  ctx.strokeStyle = '#8A7F66';
  ctx.lineWidth = 1;
  ctx.fillRect(0, -3, len, 6);
  ctx.strokeRect(0, -3, len, 6);
  // Splintered end
  ctx.beginPath();
  ctx.moveTo(len, -4); ctx.lineTo(len + 5, -1); ctx.lineTo(len + 2, 1); ctx.lineTo(len + 6, 4); ctx.lineTo(len, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Meat still clinging where it tore out
  ctx.fillStyle = '#9B111E';
  ctx.beginPath();
  ctx.ellipse(2, 0, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E57373';
  ctx.beginPath();
  ctx.ellipse(3, -2, 3, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** A loose eyeball, veiny, trailing its nerve. `boiled` = cooked white and cloudy. */
const eyeball = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, dir: number, boiled = false) => {
  ctx.strokeStyle = '#8E2436';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - dir * r * 0.8, y);
  ctx.quadraticCurveTo(x - dir * r * 2.2, y + 3, x - dir * r * 3.2, y + 1);
  ctx.stroke();
  ctx.fillStyle = boiled ? '#E8E4DA' : '#FAFAFA';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 30, 40, 0.8)';
  ctx.lineWidth = 0.8;
  for (let k = 0; k < 4; k++) {
    const a = k * 1.6;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a + 0.3) * r * 0.45, y + Math.sin(a + 0.3) * r * 0.45);
    ctx.stroke();
  }
  ctx.fillStyle = boiled ? 'rgba(160, 160, 150, 0.8)' : '#3E6B2F';
  ctx.beginPath();
  ctx.arc(x + dir * r * 0.35, y - r * 0.1, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  if (!boiled) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + dir * r * 0.4, y - r * 0.1, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** A cut through frozen meat: red flesh, white fat marbling, a ring of bone. */
const meatSection = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.fillStyle = '#A3141F';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.7, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 235, 225, 0.8)';
  ctx.lineWidth = 1;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    ctx.moveTo(x - r * 0.5, y + k * r * 0.4);
    ctx.quadraticCurveTo(x, y + k * r * 0.4 - 3, x + r * 0.5, y + k * r * 0.4 + 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#F3E9D2';
  ctx.beginPath();
  ctx.arc(x + r * 0.1, y - r * 0.2, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C2A36B';
  ctx.beginPath();
  ctx.arc(x + r * 0.1, y - r * 0.2, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

/** Wet, raw flesh showing through a wound, glistening. */
const rawWound = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, frame: number) => {
  ctx.fillStyle = '#5C0A12';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#B3202E';
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.75, ry * 0.75, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E05A6A';
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.arc(x - rx * 0.3 + k * rx * 0.3, y - ry * 0.2 + (k % 2) * ry * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = frame % 40 < 3 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.3, y - ry * 0.4, rx * 0.2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
};

/** Organs showing through melting ice: heart, a liver, a coil of gut. */
const organs = (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#8B1A2B';
  ctx.beginPath();
  ctx.ellipse(x - 12, y, 12, 8, 0.4, 0, Math.PI * 2);   // liver
  ctx.fill();
  ctx.fillStyle = '#B71C1C';
  ctx.beginPath();
  ctx.arc(x + 8, y - 4, 6, 0, Math.PI * 2);               // heart
  ctx.arc(x + 14, y - 4, 6, 0, Math.PI * 2);
  ctx.moveTo(x + 3, y - 2); ctx.lineTo(x + 11, y + 8); ctx.lineTo(x + 19, y - 2);
  ctx.fill();
  ctx.strokeStyle = '#C9566E';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + 26, y + 2, 5, 0, Math.PI * 1.7);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

/** Blood oozing out of every crack in a stone body (local sprite space). */
const bleedFromCracks = (ctx: CanvasRenderingContext2D, frame: number) => {
  ctx.fillStyle = '#8B0000';
  for (let k = 0; k < 4; k++) {
    const sx = 14 + k * 17, len = 8 + ((frame * 0.3 + k * 11) % 26);
    ctx.fillRect(sx, 20 + k * 12, 2.5, len);
    ctx.beginPath();
    ctx.arc(sx + 1.2, 20 + k * 12 + len, 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** Pink-red swirls of blood mixing into a puddle. */
const bloodSwirls = (ctx: CanvasRenderingContext2D, x: number, floor: number, w: number) => {
  ctx.strokeStyle = 'rgba(160, 10, 20, 0.8)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.ellipse(x - w * 0.4 + k * w * 0.4, floor - 3, 10 + k * 3, 2.5, 0, 0.3, Math.PI * 1.6);
    ctx.stroke();
  }
};

/** Blood sprayed out across the floor in streaks, and up the air in droplets. */
const bloodSpray = (ctx: CanvasRenderingContext2D, x: number, floor: number, frame: number) => {
  ctx.fillStyle = '#7A0000';
  for (const dir of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const len = 30 + k * 18;
      ctx.beginPath();
      ctx.moveTo(x + dir * 60, floor - 2 - k);
      ctx.lineTo(x + dir * (60 + len), floor - 1 - k * 0.5);
      ctx.lineTo(x + dir * 60, floor + 1 - k);
      ctx.fill();
    }
  }
  void frame;
};

/** Streams of blood from the eyes and nose. */
const bloodStreams = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.fillStyle = '#9B0000';
  for (let k = 0; k < 3; k++) {
    const len = 10 + ((frame * 0.25 + k * 9) % 22);
    ctx.fillRect(x - 8 + k * 7, y, 2.5, len);
    ctx.beginPath();
    ctx.arc(x - 7 + k * 7, y + len, 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** The skin burnt through in glowing splits of raw meat. */
const charredSplits = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.shadowColor = '#FF3D00';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = frame % 30 < 15 ? '#E53935' : '#FF7043';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.moveTo(x - 30 + k * 16, y - 8 + (k % 2) * 10);
    ctx.lineTo(x - 22 + k * 16, y + (k % 2) * 6);
    ctx.lineTo(x - 26 + k * 16, y + 12);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

/** Ribs showing through a burnt-away chest. */
const ribs = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = '#4A0A0A';
  ctx.beginPath();
  ctx.ellipse(x, y, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E8DFC8';
  ctx.lineWidth = 2.5;
  for (let k = -2; k <= 2; k++) {
    ctx.beginPath();
    ctx.moveTo(x + k * 6, y - 11);
    ctx.quadraticCurveTo(x + k * 6 + 4, y, x + k * 6, y + 11);
    ctx.stroke();
  }
};

/** Half the face melted away to the skull, with strings of flesh hanging off (local sprite space). */
const halfSkull = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.fillStyle = '#EDE3CC';
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.quadraticCurveTo(x + 26, y + 4, x + 26, y + 26);
  ctx.lineTo(x + 20, y + 40);
  ctx.lineTo(x, y + 42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 22, 6, 7, 0, 0, Math.PI * 2);   // eye socket
  ctx.fill();
  ctx.fillRect(x + 4, y + 33, 3, 5);                        // teeth gaps
  ctx.fillRect(x + 10, y + 33, 3, 5);
  ctx.fillRect(x + 16, y + 33, 3, 5);
  // Melting skin edge and dangling strings
  ctx.strokeStyle = '#A33B2A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 42);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  for (let k = 0; k < 3; k++) {
    const len = 6 + ((frame * 0.2 + k * 7) % 10);
    ctx.beginPath();
    ctx.moveTo(x + 4 + k * 8, y + 42);
    ctx.lineTo(x + 4 + k * 8, y + 42 + len);
    ctx.stroke();
  }
};

/** Flies gathering on the body once it's been lying there a moment. */
const flies = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, age: number, count: number) => {
  const n = Math.min(count, Math.floor(age / 40));
  for (let k = 0; k < n; k++) {
    const a = frame * (0.3 + k * 0.07) + k * 2.4;
    const fx = x + Math.cos(a) * (18 + k * 7), fy = y + Math.sin(a * 1.4) * 12;
    ctx.fillStyle = 'rgba(220, 230, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(fx - 2, fy - 2.5, 2.2, 1.3, -0.6 + (frame % 2) * 0.8, 0, Math.PI * 2);
    ctx.ellipse(fx + 2, fy - 2.5, 2.2, 1.3, 0.6 - (frame % 2) * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
};
