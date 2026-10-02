import type { GameState } from '../../core/state';
import type { WeaponType } from '../../../types';
import { drawPlayer } from './player';
import { pantsColor, bootColor } from './body';
import { MEATHEAD_DEATH_FRAMES, LAVA_COOKOFF, FROZEN_SHATTER, ROADKILL_TWINKLE, overdoseRise, impaledFeet, MeatheadDeath } from '../../player/deathAnim';

// Meathead's own deaths (see player/deathAnim): him, drawn in his place, going whichever way it got him.

type Ctx = CanvasRenderingContext2D;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const H = 64;

/** Him as he was, stood at (d.x, d.y), with whatever's been done to the canvas round it. */
const body = (ctx: Ctx, state: GameState, d: MeatheadDeath, weapon: WeaponType, extra: Record<string, unknown> = {}) => {
  const p = state.player;
  const b = {
    ...p, pos: { x: d.x - p.width / 2, y: d.y - p.height }, facing: d.facing, hidden: false, headless: 0, shownDead: false, isGrounded: true,
    vel: { x: 0, y: 0 }, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false,
    isDivekicking: false, isDucking: false, squash: 0, hurtForm: null, hurtFormTimer: 0, filthShieldTimer: 0, ...extra,
  };
  drawPlayer(ctx, b as typeof p, { ...state, deathTimer: 0, playerVulgarityTimer: 0 }, { currentWeapon: weapon, showFilthShield: false, invincibilityEnabled: false });
};

/** Turn the canvas about (x, y). */
const about = (ctx: Ctx, x: number, y: number, rot: number, sx = 1, sy = 1) => { ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-x, -y); };

export const drawMeatheadDeath = (ctx: Ctx, state: GameState, weapon: WeaponType) => {
  const d = state.meatheadDeath!;
  const t = Math.min(state.deathScene?.t ?? 9999, MEATHEAD_DEATH_FRAMES[d.kind]);
  const f = state.frame;
  const { x, y, facing } = d;
  ctx.save();
  switch (d.kind) {
    case 'burnt': {
      // On fire, hopping and flailing; going black; stood there crisp, smoking, blinking; then crumbling to ash
      const char = clamp01(t / 40);
      const crumble = clamp01((t - 58) / 24);
      const pile = clamp01((t - 58) / 24);
      if (crumble < 1) {
        ctx.save();
        if (crumble > 0) { ctx.beginPath(); ctx.rect(x - 60, y - H + crumble * H, 120, H); ctx.clip(); }
        if (t < 40) ctx.translate(Math.sin(t * 1.7) * 2.5, -Math.abs(Math.sin(t * 0.45)) * 7);
        ctx.filter = `brightness(${1 - char * 0.93}) sepia(${char * 0.6})`;
        body(ctx, state, d, weapon);
        ctx.restore();
        // (the flames all over him)
        if (t < 42) for (let k = 0; k < 7; k++) {
          const fx = x + ((k * 13) % 34) - 17, fh = 10 + ((k * 7 + f) % 9);
          const fy = y - 6 - ((k * 23) % 52);
          ctx.fillStyle = k % 2 ? 'rgba(249, 115, 22, 0.85)' : 'rgba(253, 224, 71, 0.85)';
          ctx.beginPath(); ctx.moveTo(fx - 4, fy); ctx.quadraticCurveTo(fx - 3, fy - fh * 0.6, fx + Math.sin(f * 0.5 + k) * 2, fy - fh); ctx.quadraticCurveTo(fx + 3, fy - fh * 0.6, fx + 4, fy); ctx.closePath(); ctx.fill();
        }
        // (stood there, crisp: his eyes, blinking, the only white left on him)
        if (t >= 42 && crumble === 0 && !(t >= 49 && t < 53)) {
          ctx.fillStyle = '#F8FAFC';
          ctx.fillRect(x + facing * 3 - 1, y - 55, 3, 3); ctx.fillRect(x + facing * 9 - 1, y - 55, 3, 3);
        }
      }
      // The pile of him
      if (pile > 0) {
        ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.ellipse(x, y, 10 + pile * 14, 2 + pile * 8, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#52525B'; for (let k = 0; k < 6; k++) ctx.fillRect(x - 12 + k * 5, y - 2 - ((k * 5) % 7) * pile, 2, 2);
        if (t > 80) { ctx.fillStyle = '#FB923C'; ctx.fillRect(x - 3 + Math.sin(f * 0.2) * 2, y - 4 * pile, 2, 2); }
      }
      break;
    }
    case 'lava': {
      // Going under, thrashing, burning as he goes; the surface at his feet
      const sink = clamp01((t - 4) / 72) * 74;
      if (sink < 72) {
        ctx.save();
        ctx.beginPath(); ctx.rect(x - 80, y - 300, 160, 300); ctx.clip();
        ctx.translate(Math.sin(t * 0.9) * 3, sink);
        about(ctx, x, y, Math.sin(t * 0.4) * 0.18);
        ctx.filter = `brightness(${1 - clamp01(sink / 60) * 0.7}) sepia(${clamp01(sink / 50)}) saturate(${1 + clamp01(sink / 50)})`;
        body(ctx, state, d, weapon);
        ctx.restore();
      }
      // His gun: up out of it after him, cooking off on its own, three rounds, and back under
      const up = clamp01((t - 80) / 6) * (1 - clamp01((t - 108) / 10));
      if (up > 0) {
        const kick = LAVA_COOKOFF.some(s => t >= s && t < s + 3) ? 3 : 0;
        ctx.save(); ctx.beginPath(); ctx.rect(x - 40, y - 100, 80, 100); ctx.clip();
        const gy = y - up * 22 + kick * 0.5;
        ctx.fillStyle = '#374151'; ctx.fillRect(x - 2, gy - 4, 5, 18); ctx.fillRect(x - 2, gy + 10, 10, 6);
        ctx.fillStyle = '#6B7280'; ctx.fillRect(x - 1, gy - 4, 1, 12);
        if (kick) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(x + 0.5, gy - 8, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x + 0.5, gy - 8, 2.5, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      // The surface where he went in: churning, glowing
      const r = 18 + Math.sin(f * 0.3) * 3 + (t < 80 ? 10 : 4);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'; ctx.beginPath(); ctx.ellipse(x, y, r, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.8)'; ctx.beginPath(); ctx.ellipse(x, y - 1, r * 0.55, 2, 0, 0, Math.PI * 2); ctx.fill();
      if (t > 112 && t < 120) { ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.arc(x + 4, y - 3 - (t - 112), 4 - (t - 112) * 0.4, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'boiled': {
      // Lobster red, hopping from foot to foot, then over he goes, steaming
      const red = clamp01(t / 30);
      const fall = clamp01((t - 45) / 12);
      if (t < 45) ctx.translate(Math.sin(t * 1.1) * 2, -Math.abs(Math.sin(t * 0.55)) * 9);
      about(ctx, x, y, -facing * fall * fall * Math.PI / 2);
      ctx.filter = `sepia(${red * 0.8}) saturate(${1 + red * 4}) hue-rotate(${-red * 25}deg) brightness(${1 + red * 0.1})`;
      body(ctx, state, d, weapon);
      break;
    }
    case 'fried': {
      const fall = clamp01((t - 42) / 14);
      if (t < 38) {
        // The x-ray: him, and his bones, flashing
        if (Math.floor(t / 3) % 2) {
          ctx.fillStyle = '#0C1A3A'; ctx.fillRect(x - 20, y - H, 40, H);
          bones(ctx, x, y, facing);
        } else { ctx.filter = 'brightness(2.2) saturate(0.4)'; ctx.translate(Math.sin(t * 2.3) * 2, 0); body(ctx, state, d, weapon); }
        break;
      }
      // Black, smoking, his hair stood straight up; and over, stiff as a plank
      about(ctx, x - facing * 10, y, -facing * fall * fall * Math.PI / 2);
      if (t > 56 && t < 62) ctx.translate(0, -Math.sin((t - 56) / 6 * Math.PI) * 3);
      ctx.save(); ctx.filter = 'brightness(0.22) sepia(0.4)'; body(ctx, state, d, weapon); ctx.restore();
      ctx.fillStyle = '#18181B';
      for (let k = -3; k <= 3; k++) { const hx = x + facing * 4 + k * 3.5; ctx.beginPath(); ctx.moveTo(hx - 2, y - 58); ctx.lineTo(hx + k * 1.2, y - 72 - (3 - Math.abs(k)) * 2); ctx.lineTo(hx + 2, y - 58); ctx.fill(); }
      ctx.fillStyle = '#F8FAFC'; if (t < 50 || t > 64) { ctx.fillRect(x + facing * 3 - 1, y - 55, 3, 3); ctx.fillRect(x + facing * 9 - 1, y - 55, 3, 3); }
      break;
    }
    case 'frozen': {
      if (t >= FROZEN_SHATTER) break;
      // Frozen solid in a block of it; it tips over; (then it shatters: see the particles)
      const ice = clamp01(t / 10);
      const tip = clamp01((t - 24) / 22);
      about(ctx, x + facing * 26, y, facing * tip * tip * Math.PI / 2);
      if (t >= 46 && t < 50) ctx.translate(0, -2);
      ctx.save(); ctx.filter = `grayscale(${ice}) brightness(${1 + ice * 0.35})`; body(ctx, state, d, weapon); ctx.restore();
      const w = 52, h = 74 * ice;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; ctx.fillRect(x - w / 2, y - h, w, h);
      ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)'; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2, y - h, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(x - w / 2 + 4, y - h + 4, 4, h * 0.6); ctx.fillRect(x - w / 2 + 10, y - h + 4, 2, h * 0.3);
      break;
    }
    case 'buried': {
      // Under a mound of it: his legs out of the top, kicking, slower and slower, still; one last twitch
      const rise = clamp01(t / 8);
      if (t < 8) body(ctx, state, d, weapon);
      const mh = 70 * rise, mw = 62;
      const kick = t > 80 && t < 84 ? 0.5 : Math.sin(t * 0.7) * 0.45 * (1 - clamp01((t - 20) / 50));
      if (t >= 8) for (const side of [-1, 1]) {
        ctx.save(); ctx.translate(x + side * 5, y - mh + 8); ctx.rotate(side * (0.18 + (side > 0 ? kick : -kick)));
        ctx.fillStyle = pantsColor; ctx.fillRect(-4, -26, 8, 26);
        ctx.fillStyle = bootColor; ctx.fillRect(-5, -34, side > 0 ? 12 : 10, 9);
        ctx.restore();
      }
      const base = d.snow ? '#F1F5F9' : '#78716C', shade = d.snow ? '#CBD5E1' : '#57534E', fleck = d.snow ? '#FFFFFF' : '#A8A29E';
      ctx.fillStyle = base; ctx.beginPath(); ctx.ellipse(x, y, mw, mh, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = shade; ctx.beginPath(); ctx.ellipse(x + 10, y, mw * 0.7, mh * 0.55, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = fleck; for (let k = 0; k < 9; k++) { const a = Math.PI + (k + 0.5) / 9 * Math.PI; ctx.fillRect(x + Math.cos(a) * mw * 0.7, y + Math.sin(a) * mh * 0.7, d.snow ? 3 : 6, d.snow ? 3 : 4); }
      break;
    }
    case 'flattened': {
      // Flat as a pancake (a bounce of it first), a twitch, and the pool under him
      const sq = t < 8 ? 0.45 - (t / 8) * 0.31 : 0.14 + (t > 34 && t < 40 ? Math.sin((t - 34) / 6 * Math.PI) * 0.04 : 0);
      const pool = clamp01(t / 50);
      ctx.fillStyle = 'rgba(127, 29, 29, 0.85)'; ctx.beginPath(); ctx.ellipse(x, y, 20 + pool * 26, 2 + pool * 3, 0, 0, Math.PI * 2); ctx.fill();
      about(ctx, x, y, 0, 1 + (1 - sq) * 0.9, sq);
      body(ctx, state, d, weapon);
      break;
    }
    case 'dissolved': {
      // Going green, slumping down into a puddle of himself; his skull bobs up in it, and goes back under
      const k = clamp01(t / 80);
      const pw = 14 + k * 34;
      ctx.fillStyle = 'rgba(77, 124, 15, 0.9)'; ctx.beginPath(); ctx.ellipse(x, y, pw, 3 + k * 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(163, 230, 53, 0.7)'; ctx.beginPath(); ctx.ellipse(x - 4, y - 1, pw * 0.5, 1.5 + k * 2, 0, 0, Math.PI * 2); ctx.fill();
      if (k < 0.97) {
        ctx.save();
        about(ctx, x, y, Math.sin(t * 0.3) * 0.05, 1 + k * 0.7, 1 - k);
        ctx.filter = `sepia(${k}) hue-rotate(${k * 55}deg) saturate(${1 + k * 2.5}) brightness(${1 - k * 0.3})`;
        body(ctx, state, d, weapon);
        ctx.restore();
      }
      const bob = t < 84 ? 0 : t < 92 ? (t - 84) / 8 : t < 100 ? 1 : 1 - (t - 100) / 8;
      if (bob > 0) {
        const sy = y - 2 - bob * 7;
        ctx.save(); ctx.beginPath(); ctx.rect(x - 30, y - 40, 60, 39); ctx.clip();
        ctx.fillStyle = '#E7E5D6'; ctx.beginPath(); ctx.arc(x, sy, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 4, sy - 3, 3, 3); ctx.fillRect(x + 1, sy - 3, 3, 3); ctx.fillRect(x - 2, sy + 3, 4, 1);
        ctx.restore();
      }
      break;
    }
    case 'roadkill': {
      // Knocked clean out of his boots: them, stood where he was; him, end over end up and off the top of the screen
      ctx.fillStyle = bootColor; ctx.fillRect(x - 12, y - 8, 10, 8); ctx.fillRect(x + 2, y - 8, 10, 8);
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - 12, y - 8, 10, 2); ctx.fillRect(x + 2, y - 8, 10, 2);
      const vx = -facing * 9, bx = x + vx * t, by = y - 20 * t + 0.32 * t * t;
      if (t < ROADKILL_TWINKLE) {
        about(ctx, bx, by - 32, -facing * t * 0.45);
        ctx.translate(bx - x, by - y);
        body(ctx, state, d, weapon);
      } else if (t < ROADKILL_TWINKLE + 16) {
        // (gone: a twinkle up at the top of the screen, where he went)
        const k = (t - ROADKILL_TWINKLE) / 16, sx = Math.max(state.camera.x + 30, Math.min(state.camera.x + 770, bx)), sy = state.camera.y + 40;
        const r = 9 * Math.sin(k * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); for (let q = 0; q < 8; q++) { const a = (q / 8) * Math.PI * 2 + k * 2, rr = q % 2 ? r * 0.3 : r; ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
      }
      break;
    }
    case 'impaled': {
      // Stopped dead on it, the icicle straight down through him, its point in the floor; off the ground, down it he slides
      const feet = impaledFeet(d, t), floor = d.floor ?? d.y;
      ctx.save();
      if (t < 6) ctx.translate(Math.sin(t * 3) * 1.5, 0);
      ctx.translate(0, feet - y);
      body(ctx, state, { ...d, y }, weapon, { isGrounded: feet >= floor - 0.5 });
      ctx.restore();
      // (blood down the length of it below him, and pooling round its point)
      const pool = Math.min(1, t / 50);
      ctx.fillStyle = 'rgba(127, 29, 29, 0.85)'; ctx.beginPath(); ctx.ellipse(x, floor, 6 + pool * 18, 1.5 + pool * 2, 0, 0, Math.PI * 2); ctx.fill();
      icicle(ctx, x, floor - 120, floor + 4);
      ctx.fillStyle = 'rgba(153, 27, 27, 0.8)'; ctx.fillRect(x - 2, feet - 64 - 10, 4, 64 + 10 + (floor - feet) * 0.9 + 4 * pool);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x - 3, feet - 70, 6, 4);
      break;
    }
    case 'cactus': {
      const im = d.impale!;
      if (im.how === 'cactus_top') {
        // Lying across the top of it, its top out through his middle
        const top = im.top ?? y;
        ctx.save();
        ctx.translate(im.x, top - 4); ctx.rotate(d.facing * Math.PI / 2); ctx.translate(-im.x, -(y - 32));
        body(ctx, state, { ...d, x: im.x }, weapon, { isGrounded: false });
        ctx.restore();
        cactusTip(ctx, im.x, top - 18, 0);
        spines(ctx, im.x, top - 4, 30, 10, t);
      } else {
        // Pinned to its side on one of its arms, out through his back
        body(ctx, state, d, weapon);
        const cy = y - 36, from = im.edge ?? x, dir = im.side ?? 1;
        ctx.fillStyle = '#3F6212'; ctx.fillRect(Math.min(from, x + dir * 20), cy - 5, Math.abs(x + dir * 20 - from), 10);
        cactusTip(ctx, x + dir * 22, cy, dir);
        spines(ctx, x, y - 32, 14, 28, t);
      }
      break;
    }
    case 'overdose': {
      // Every colour there is, a slow spin, and up he floats, blissed out, and away
      const rise = overdoseRise(t);
      ctx.globalAlpha = 1 - clamp01((t - 95) / 25);
      ctx.translate(Math.sin(t * 0.12) * 10, -rise);
      about(ctx, x, y - 32, Math.sin(t * 0.09) * 0.5 + Math.max(0, t - 30) * 0.02);
      ctx.filter = `hue-rotate(${t * 14}deg) saturate(${1 + clamp01(t / 20) * 2})`;
      body(ctx, state, d, weapon, { isGrounded: false, vel: { x: 0, y: 1 } });
      break;
    }
  }
  ctx.restore();
};

/** An icicle, point down, from top to tip. */
const icicle = (ctx: Ctx, x: number, top: number, tip: number) => {
  ctx.fillStyle = 'rgba(186, 230, 253, 0.95)'; ctx.beginPath(); ctx.moveTo(x - 8, top); ctx.lineTo(x + 8, top); ctx.lineTo(x + 1, tip); ctx.lineTo(x - 1, tip); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath(); ctx.moveTo(x - 6, top); ctx.lineTo(x - 3, top); ctx.lineTo(x, tip - 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 8, top); ctx.lineTo(x - 1, tip); ctx.moveTo(x + 8, top); ctx.lineTo(x + 1, tip); ctx.stroke();
};

/** The rounded end of a saguaro's trunk (dir 0, pointing up) or arm (dir -1 or 1, pointing that way), out through him, bloody, with its spines. */
const cactusTip = (ctx: Ctx, x: number, y: number, dir: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(dir === 0 ? 0 : dir * Math.PI / 2);
  ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.moveTo(-6, 16); ctx.lineTo(-6, 0); ctx.arc(0, 0, 6, Math.PI, 0); ctx.lineTo(6, 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#65A30D'; ctx.fillRect(-1, -4, 2, 20);
  ctx.strokeStyle = '#FEF3C7'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(-6, 2 + k * 4); ctx.lineTo(-9, 1 + k * 4); ctx.moveTo(6, 2 + k * 4); ctx.lineTo(9, 1 + k * 4); } ctx.moveTo(0, -6); ctx.lineTo(0, -9); ctx.stroke();
  ctx.fillStyle = 'rgba(153, 27, 27, 0.85)'; ctx.fillRect(-6, 8, 12, 4); ctx.fillRect(-2, 0, 3, 8);
  ctx.restore();
};

/** Spines stuck in him all over, round (x, y), w by h. */
const spines = (ctx: Ctx, x: number, y: number, w: number, h: number, t: number) => {
  ctx.strokeStyle = '#FEF3C7'; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = 0; k < 16; k++) { const sx = x + (((k * 37) % 21) / 21 - 0.5) * w * 2, sy = y + (((k * 53) % 17) / 17 - 0.5) * h * 2, a = k * 2.1; ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * 4, sy + Math.sin(a) * 4); }
  ctx.stroke();
  void t;
};

/** His bones, stood at his feet (x, y): for the x-ray. */
const bones = (ctx: Ctx, x: number, y: number, facing: number) => {
  ctx.strokeStyle = '#F8FAFC'; ctx.fillStyle = '#F8FAFC'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x + facing * 4, y - 54, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0C1A3A'; ctx.fillRect(x + facing * 4 - 4, y - 56, 3, 3); ctx.fillRect(x + facing * 4 + 1, y - 56, 3, 3); ctx.fillRect(x + facing * 4 - 3, y - 50, 6, 1);
  ctx.beginPath();
  ctx.moveTo(x, y - 46); ctx.lineTo(x, y - 24);
  for (let r = -42; r <= -30; r += 4) { ctx.moveTo(x - 8, r + y); ctx.lineTo(x + 8, r + y); }
  ctx.moveTo(x - 10, y - 43); ctx.lineTo(x - 12, y - 26); ctx.moveTo(x + 10, y - 43); ctx.lineTo(x + 16, y - 32); ctx.lineTo(x + 24, y - 36);
  ctx.moveTo(x - 5, y - 24); ctx.lineTo(x - 7, y); ctx.moveTo(x + 5, y - 24); ctx.lineTo(x + 7, y);
  ctx.stroke();
  ctx.lineCap = 'butt';
};
