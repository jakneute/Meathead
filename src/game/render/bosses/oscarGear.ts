import { Enemy, Player, Projectile } from '../../../types';
import { OSCAR_FLICK_WINDUP, OSCAR_TASER_HOLD_FRAMES, TASER_OVERLOAD_FRAMES } from '../../../constants';
import { GameState } from '../../core/state';
import { getOscarLauncher, getOscarMouth, flameStrength } from '../../bosses/oscar';
import { muzzlePoint } from '../../combat/muzzle';
import { Head, inHead } from './kit';
import { drawFire } from '../fx/fire';
import { FIRE_RAMP } from '../fx/fireball';
import { steppedGlow } from '../pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from '../npc/kit';

/** Oily Oscar's gear, laser sight, rockets, cigarette, oil slicks and fire. */

// ---------------------------------------------------------------------------
// Oil and fire
// ---------------------------------------------------------------------------

/** Glossy black oil strips with a drifting rainbow sheen (drawn under everything). */
export const drawOilSlicks = (ctx: CanvasRenderingContext2D, state: GameState) => {
  if (state.oilCells.length === 0) return;
  const frame = state.frame;
  ctx.save();
  for (const c of state.oilCells) {
    ctx.globalAlpha = c.burn > 0 ? 1 : Math.min(1, c.life / 60);
    const scorched = c.burn > 0;
    // A thick, lumpy coat of crude standing proud of the surface
    const bump = 3 + ((c.index * 37) % 5);
    const thick = 7;
    ctx.fillStyle = scorched ? '#2a1408' : '#050302';
    let sheen: [number, number, number, number];
    if (c.surface === 'floor') {
      ctx.fillRect(c.x, c.y + c.h - thick, c.w, thick);
      ctx.fillRect(c.x + 4, c.y + c.h - thick - bump, c.w - 8, bump);
      sheen = [c.x + 3, c.y + c.h - thick - bump, c.w - 6, 2];
    } else if (c.surface === 'ceiling') {
      ctx.fillRect(c.x, c.y, c.w, thick);
      ctx.fillRect(c.x + 4, c.y + thick, c.w - 8, bump);
      sheen = [c.x + 3, c.y + thick + bump - 2, c.w - 6, 2];
    } else {
      const wx = c.surface === 'left' ? c.x : c.x + c.w - thick;
      ctx.fillRect(wx, c.y, thick, c.h);
      ctx.fillRect(c.surface === 'left' ? wx + thick : wx - bump, c.y + 4, bump, Math.max(0, c.h - 8));
      sheen = [c.surface === 'left' ? wx + thick + bump - 2 : wx - bump, c.y + 3, 2, Math.max(0, c.h - 6)];
    }

    if (!scorched) {
      // Rainbow petroleum sheen drifting along the slick, plus a wet glint
      const hue = (c.x * 1.5 + c.y * 1.5 + frame * 3) % 360;
      ctx.fillStyle = `hsla(${hue}, 90%, 62%, 0.8)`;
      ctx.fillRect(sheen[0], sheen[1], sheen[2], sheen[3]);
      if ((c.index + Math.floor(frame / 20)) % 4 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(sheen[0] + sheen[2] / 2, sheen[1], 2, 2);
      }
    }

    // Drips off the ceiling and down the walls
    if (!scorched && c.surface !== 'floor' && (c.index * 7) % 3 === 0) {
      const period = 70 + (c.index % 4) * 11;
      const t = (frame + c.index * 23) % period;
      ctx.fillStyle = '#0b0705';
      if (c.surface === 'ceiling') {
        const len = Math.min(10, t * 0.3);
        ctx.fillRect(c.x + 10, c.y + c.h, 3, len);
        if (t > 35) ctx.fillRect(c.x + 10, c.y + c.h + (t - 35) * 5, 3, 5);
      } else {
        ctx.fillRect(c.surface === 'left' ? c.x + 1 : c.x - 1, c.y + (t * 0.35) % c.h, 3, 6);
      }
    }
  }
  ctx.restore();
};

/** Flames licking off every burning strip (drawn in front of Meathead). */
export const drawOscarFire = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const burning = state.oilCells.filter(c => c.burn > 0);
  if (burning.length === 0) return;
  ctx.save();
  for (const c of burning) {
    const s = flameStrength(c);
    if (s <= 0) continue;
    ctx.save();
    // Local frame: the surface runs along +x, flames rise toward -y
    switch (c.surface) {
      case 'floor': ctx.translate(c.x, c.y + c.h); break;
      case 'ceiling': ctx.translate(c.x + c.w, c.y); ctx.rotate(Math.PI); break;
      case 'left': ctx.translate(c.x, c.y); ctx.rotate(Math.PI / 2); break;
      case 'right': ctx.translate(c.x + c.w, c.y + c.h); ctx.rotate(-Math.PI / 2); break;
    }
    const len = c.surface === 'floor' || c.surface === 'ceiling' ? c.w : c.h;
    drawFlameTongues(ctx, len, s, c.index, state.frame, c.surface === 'floor');
    ctx.restore();
  }
  ctx.restore();
};

const drawFlameTongues = (ctx: CanvasRenderingContext2D, len: number, s: number, seed: number, frame: number, smoky: boolean) => {
  // One fire the length of the strip, standing on it (smoke only off the floor: it'd roll the wrong way off a wall)
  drawFire(ctx, len / 2, 0, len + 6, 60, frame, { seed: seed * 13, k: s, smoke: smoky ? 0.35 : 0, glow: 0.8 });
};

// ---------------------------------------------------------------------------
// Oscar himself
// ---------------------------------------------------------------------------

/** His rocket launcher, cigarette, flicking arm, ash face and taser meter (world space). */
export const drawOscarGear = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const facing = e.oscarFacing || -1;
  if (e.bossState === 'ash_face') drawAshFace(ctx, e, frame);
  else drawCigaretteAndArm(ctx, e, frame, facing);
  drawLauncher(ctx, e, frame);
  if (e.taserHold && e.taserHold > 0) drawHoldMeter(ctx, e, frame);
  if (e.fireproofFlash && e.fireproofFlash > 0) drawFireproofShimmer(ctx, e, frame);
};

/** The flamethrower bouncing off his suit: a silver heat-shield shimmer rippling over him. */
const drawFireproofShimmer = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const a = Math.min(1, e.fireproofFlash! / 8);
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, e.width * 0.85);
  g.addColorStop(0, 'rgba(176, 190, 197, 0)');
  g.addColorStop(0.7, `rgba(207, 216, 220, ${0.35 * a})`);
  g.addColorStop(1, 'rgba(207, 216, 220, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - e.width, cy - e.height, e.width * 2, e.height * 2);
  ctx.restore();
  // A bright outline with a sheen sweeping across it
  ctx.save();
  ctx.strokeStyle = `rgba(236, 239, 241, ${0.8 * a})`;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(cx, cy, e.width * 0.62, e.height * 0.66, 0, 0, Math.PI * 2); ctx.stroke();
  const sweep = ((frame * 6) % (e.height + 40)) - 20;
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * a})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - e.width * 0.5, e.pos.y + sweep); ctx.lineTo(cx + e.width * 0.5, e.pos.y + sweep - 12); ctx.stroke();
  ctx.restore();
};

const drawLauncher = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const L = getOscarLauncher(e);
  ctx.save();
  ctx.translate(L.pivotX, L.pivotY);
  ctx.rotate(L.angle);
  if (Math.cos(L.angle) < 0) ctx.scale(1, -1); // keep the sight on top
  const loaded = e.bossState !== 'shooting';

  // Tube
  ctx.fillStyle = '#4E5B31';
  ctx.fillRect(-8, -7, 52, 14);
  ctx.strokeStyle = '#263016';
  ctx.lineWidth = 2;
  ctx.strokeRect(-8, -7, 52, 14);
  // Hazard band
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#F9A825' : '#111111';
    ctx.fillRect(8 + i * 4, -7, 4, 14);
  }
  // Flared exhaust and muzzle rings
  ctx.fillStyle = '#212121';
  ctx.fillRect(-12, -9, 5, 18);
  ctx.fillRect(40, -8, 6, 16);
  // Sight and grip
  ctx.fillStyle = '#37474F';
  ctx.fillRect(18, -13, 10, 6);
  ctx.fillStyle = '#B71C1C';
  ctx.fillRect(26, -12, 2, 3);
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(4, 7, 6, 9);
  // Warhead peeking out when loaded
  if (loaded) {
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.moveTo(46, -5);
    ctx.lineTo(54, 0);
    ctx.lineTo(46, 5);
    ctx.closePath();
    ctx.fill();
  } else if ((e.stateTimer || 0) > 12) {
    // Muzzle flash
    ctx.fillStyle = frame % 2 === 0 ? '#FFEB3B' : '#FF9800';
    ctx.beginPath();
    ctx.moveTo(46, -10);
    ctx.lineTo(70, 0);
    ctx.lineTo(46, 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Shoulder mount
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.arc(L.pivotX, L.pivotY, 5, 0, Math.PI * 2);
  ctx.fill();
};

/** Drawn from the filter end, or around its middle when `centered` (for tumbling through the air). */
const drawCigarette = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, frame: number, scale = 1, centered = false) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  if (centered) ctx.translate(-8.25, 0);
  ctx.fillStyle = '#D7A86E';        // filter
  ctx.fillRect(0, -1.5, 4, 3);
  ctx.fillStyle = '#FAFAFA';        // paper
  ctx.fillRect(4, -1.5, 9, 3);
  ctx.fillStyle = '#757575';        // ash
  ctx.fillRect(13, -1.5, 1.5, 3);
  ctx.fillStyle = frame % 10 < 5 ? '#FF5722' : '#FF8A65'; // ember
  ctx.shadowColor = '#FF5722';
  ctx.shadowBlur = 6;
  ctx.fillRect(14.5, -1.5, 2, 3);
  ctx.restore();
};

const drawSmokeWisp = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const t = ((frame * 0.6 + i * 12) % 36) / 36;
    ctx.globalAlpha = 0.45 * (1 - t);
    ctx.fillStyle = '#BDBDBD';
    ctx.beginPath();
    ctx.arc(x + Math.sin(t * 6 + i) * 3, y - t * 26, 2 + t * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

/** Cigarette in his respirator; during the flick an arm plucks it out and snaps it away. */
const drawCigaretteAndArm = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number, facing: number) => {
  const mouth = getOscarMouth(e);
  const flicking = e.bossState === 'flicking';
  if (!flicking) {
    if (!e.hasCigarette) return;
    const angle = facing === 1 ? 0.25 : Math.PI - 0.25;
    drawCigarette(ctx, mouth.x, mouth.y, angle, frame, 1.5);
    drawSmokeWisp(ctx, mouth.x + Math.cos(angle) * 24, mouth.y + Math.sin(angle) * 24, frame);
    return;
  }

  // Wind-up: hand comes up to the mouth, pulls the cigarette, cocks back, flicks
  const t = 1 - Math.max(0, e.stateTimer || 0) / OSCAR_FLICK_WINDUP;
  const shoulder = { x: e.pos.x + e.width / 2 - facing * e.width * 0.3, y: e.pos.y + e.height * 0.42 };
  const hip = { x: shoulder.x + facing * 6, y: shoulder.y + 26 };
  const cocked = { x: mouth.x - facing * 14, y: mouth.y - 14 };
  const flung = { x: shoulder.x + facing * 44, y: shoulder.y - 20 };
  const lerp = (a: { x: number, y: number }, b: { x: number, y: number }, k: number) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
  let hand;
  if (t < 0.45) hand = lerp(hip, mouth, t / 0.45);
  else if (t < 0.85) hand = lerp(mouth, cocked, (t - 0.45) / 0.4);
  else hand = lerp(cocked, flung, Math.min(1, (t - 0.85) / 0.15));

  if (t < 0.45 && e.hasCigarette) drawCigarette(ctx, mouth.x, mouth.y, facing === 1 ? 0.25 : Math.PI - 0.25, frame, 1.5);
  ctx.save();
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(shoulder.x, shoulder.y);
  ctx.lineTo(hand.x, hand.y);
  ctx.stroke();
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.arc(hand.x, hand.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (t >= 0.45 && e.hasCigarette) {
    // Held up high between his fingers so you can see what's coming
    drawCigarette(ctx, hand.x, hand.y - 6, facing === 1 ? -0.4 : Math.PI + 0.4, frame, 2.2);
    drawSmokeWisp(ctx, hand.x + facing * 30, hand.y - 20, frame);
  }
};

/**
 * Blown-up cigarette: his face blacked with soot to the hat brim, big blinking cartoon eyes and a little "o" of a
 * mouth, the moustache singed to a frizz, hair blown out from under the Stetson, the hat scorched and smoking.
 * Drawn on his head as it is (the face kit's unit space), and it clears up at the end.
 */
const drawAshFace = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const fade = Math.min(1, (e.stateTimer || 0) / 30);
  const k = e.width / 80;
  const f = (e.oscarFacing || -1) as 1 | -1;
  const h: Head = { x: e.pos.x + 40 * k, y: e.pos.y + 19 * k, s: 1.35 * k, f };
  ctx.save();
  ctx.globalAlpha = fade;
  inHead(ctx, h, () => {
    // Soot over the face, ragged at the edges, a little lighter where it's thinner
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const r = 1 + (i % 2 ? 0.08 : -0.06);
      const x = Math.cos(a) * 12.2 * r, y = -0.5 + Math.sin(a) * 12 * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(64, 64, 64, 0.6)';
    ctx.beginPath(); ctx.ellipse(6, 1, 3.5, 2.5, 0.3, 0, Math.PI * 2); ctx.fill();
    // Hair blown out from under the hat
    ctx.strokeStyle = '#0A0A0A'; ctx.lineWidth = 1; ctx.lineCap = 'round';
    for (const [x, y, dx] of [[-12, -8, -1], [-12.5, -4, -1], [11.5, -8, 1], [12, -4, 1]] as const) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx * 2, y - 1.5); ctx.lineTo(x + dx * 1.2, y - 3); ctx.lineTo(x + dx * 3, y - 4); ctx.stroke();
    }
    // The moustache, singed to a frizz
    ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 0.6;
    for (let i = 0; i < 6; i++) { const x = -3.5 + i * 1.8; ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x + (i % 2 ? 0.8 : -0.8), 1.8); ctx.stroke(); }
    // Big cartoon eyes, blinking
    const blink = frame % 45 < 5;
    for (const x of [-5, 4.5]) {
      if (blink) {
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(x - 3, -3.5); ctx.lineTo(x + 3, -3.5); ctx.stroke();
      } else {
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, -3.5, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(x + Math.sin(frame * 0.2) * 0.9, -3, 1.3, 0, Math.PI * 2); ctx.fill();
      }
    }
    // A dazed little "o" of a mouth
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(1, 6, 1.6, 0, Math.PI * 2); ctx.stroke();
    // The Stetson, scorched: the brim blackened and frayed, the crown charred
    ctx.fillStyle = '#2A1A0E';
    ctx.beginPath(); ctx.ellipse(0, -11, 17, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, -12); ctx.lineTo(-8, -20); ctx.quadraticCurveTo(-3, -18, 0, -21); ctx.quadraticCurveTo(3, -18, 8, -20); ctx.lineTo(9, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5B3A1E';
    ctx.fillRect(-7, -17, 3, 2); ctx.fillRect(3, -19, 2.5, 1.5);
    ctx.fillStyle = '#F97316';
    if (frame % 20 < 12) { ctx.fillRect(-15, -11.4, 1.2, 0.8); ctx.fillRect(12, -10.8, 1.2, 0.8); } // embers on the brim
    ctx.fillStyle = '#0A0A0A';
    for (const x of [-16.5, -14, 13.5, 16]) { ctx.beginPath(); ctx.moveTo(x - 1, -11); ctx.lineTo(x, -8.5); ctx.lineTo(x + 1, -11); ctx.fill(); }
  });
  ctx.restore();
  // Smoke off the hat
  drawSmokeWisp(ctx, h.x - 10 * k, h.y - 26 * k, frame);
  drawSmokeWisp(ctx, h.x + 9 * k, h.y - 29 * k, frame + 17);
};

/** How close the taser is to bursting him. */
const drawHoldMeter = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const pct = Math.min(1, (e.taserHold || 0) / OSCAR_TASER_HOLD_FRAMES);
  const x = e.pos.x, y = e.pos.y - 24, w = e.width;
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - 1, y - 1, w + 2, 8);
  ctx.fillStyle = pct > 0.75 && frame % 6 < 3 ? '#FFFFFF' : '#00E5FF';
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 8;
  ctx.fillRect(x, y, w * pct, 6);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Laser sight, projectiles, taser overload
// ---------------------------------------------------------------------------

/** Red laser from his launcher to Meathead's feet, with a reticle that closes as he locks on. */
export const drawOscarLaser = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const boss = state.enemies.find(e => e.type === 'boss' && e.health > 0 && e.bossState === 'aiming');
  if (!boss || boss.aimX === undefined || boss.aimY === undefined) return;
  const L = getOscarLauncher(boss);
  const lock = boss.lockProgress || 0;
  // Ready to fire: strobe hard so the player knows to get out of the way now
  const firing = (boss.fireWarning || 0) > 0;
  const blinkOff = firing && state.frame % 4 < 2;
  if (blinkOff) return;
  ctx.save();
  ctx.strokeStyle = firing ? '#FFFFFF' : `rgba(255, 23, 68, ${0.35 + lock * 0.55})`;
  ctx.lineWidth = firing ? 4 : 1 + lock * 2;
  ctx.shadowColor = '#FF1744';
  ctx.shadowBlur = 6;
  ctx.shadowBlur = firing ? 16 : 6;
  ctx.beginPath();
  ctx.moveTo(L.muzzleX, L.muzzleY);
  ctx.lineTo(boss.aimX, boss.aimY);
  ctx.stroke();
  // Reticle (squashed flat onto the floor when he's aiming at the floor)
  if (boss.oscarAimMode === 'floor') {
    ctx.translate(boss.aimX, boss.aimY);
    ctx.scale(1.4, 0.4);
    ctx.translate(-boss.aimX, -boss.aimY);
  }
  const r = 6 + 26 * (1 - lock);
  ctx.lineWidth = firing ? 3 : 2;
  ctx.strokeStyle = firing ? '#FFFFFF' : '#FF1744';
  ctx.beginPath();
  ctx.arc(boss.aimX, boss.aimY, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + state.frame * 0.05;
    ctx.beginPath();
    ctx.moveTo(boss.aimX + Math.cos(a) * (r + 3), boss.aimY + Math.sin(a) * (r + 3));
    ctx.lineTo(boss.aimX + Math.cos(a) * (r + 10), boss.aimY + Math.sin(a) * (r + 10));
    ctx.stroke();
  }
  ctx.fillStyle = '#FF5252';
  ctx.beginPath();
  ctx.arc(boss.aimX, boss.aimY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawOscarRocket = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  ctx.save();
  ctx.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
  if (p.vel.x < 0) ctx.scale(-1, 1);
  ctx.rotate(Math.atan2(p.vel.y, Math.abs(p.vel.x))); // (mirrored going left, so it's never flying upside down)
  // Exhaust: chunky bands, red outside to a white-hot throat, each shivering on its own
  const exhaust = [['#B91C1C', 18, 5], ['#EA580C', 14, 4], ['#F59E0B', 10, 3], ['#FDE047', 6, 2], ['#FEF9C3', 3, 1]] as const;
  exhaust.forEach(([col, len, hw], i) => {
    const l = Math.round((len + Math.sin(frame * (0.9 + i * 0.37) + i) * 3 + (Math.random() < 0.3 ? 3 : 0)) / 2) * 2;
    ctx.fillStyle = col;
    for (let x = 0; x < l; x += 2) ctx.fillRect(-12 - x - 2, -Math.round(hw * (1 - x / l) + 0.5), 2, Math.round(hw * (1 - x / l) + 0.5) * 2);
  });
  // (a puff of smoke left behind, in steps, and a spark)
  const sx = -36 - (frame % 6) * 2, sy = -3 + (frame % 3);
  ctx.fillStyle = 'rgba(41, 37, 36, 0.45)'; ctx.fillRect(sx, sy + 2, 6, 2); ctx.fillRect(sx + 2, sy, 2, 6);
  ctx.fillStyle = 'rgba(87, 83, 78, 0.5)'; ctx.fillRect(sx + 1, sy + 1, 4, 4);
  ctx.fillStyle = 'rgba(168, 162, 158, 0.5)'; ctx.fillRect(sx + 1, sy + 1, 2, 2);
  if (frame % 3 === 0) { ctx.fillStyle = '#FDE047'; ctx.fillRect(-30 - (frame % 4) * 2, frame % 2 ? 4 : -6, 2, 2); }
  // Fins, then the tube (olive drab in steps, a yellow stencil band, rivets), then the red warhead
  shaded(ctx, () => { ctx.moveTo(-12, -4); ctx.lineTo(-12, -7); ctx.lineTo(-8, -7); ctx.lineTo(-5, -4); ctx.closePath(); }, '#33401F', -12, -7, 7, 3);
  shaded(ctx, () => { ctx.moveTo(-12, 4); ctx.lineTo(-12, 7); ctx.lineTo(-8, 7); ctx.lineTo(-5, 4); ctx.closePath(); }, '#33401F', -12, 4, 7, 3);
  shadedTop(ctx, () => ctx.rect(-12, -4, 20, 8), '#556536', -12, -4, 20, 8);
  ctx.fillStyle = '#8A9A5B'; ctx.fillRect(-11, -3, 17, 1);
  ctx.fillStyle = '#D4A017'; ctx.fillRect(2, -3.5, 2, 7);
  ctx.fillStyle = '#2B3418'; ctx.fillRect(-9, 1, 1, 1); ctx.fillRect(-4, 1, 1, 1);
  shaded(ctx, () => { ctx.moveTo(8, -4); ctx.lineTo(16, 0); ctx.lineTo(8, 4); ctx.closePath(); }, '#C62828', 8, -4, 8, 8);
  ctx.fillStyle = '#FFCDD2'; ctx.fillRect(9, -3, 2, 1);
  // Oil sloshing out: an inked glob with a drip hanging off it, a shine on it
  ink(ctx, () => { ctx.arc(-2, 4, 2.5, 0, Math.PI * 2); ctx.rect(-3, 5, 1.5, 3); }, '#050505', 0.8);
  ctx.fillStyle = '#6B6B6B'; ctx.fillRect(-3, 3, 1, 1);
  ctx.restore();
};

/**
 * The flicked cigarette, tumbling, centred on (0, 0) and `s` times the one in his mouth: inked, a cork filter with a
 * gold band, the paper charring toward the ash, the ember red round the edge to yellow in the middle.
 */
const drawTumblingCigarette = (ctx: CanvasRenderingContext2D, angle: number, frame: number, s: number) => {
  ctx.save();
  ctx.rotate(angle);
  const x0 = -8.25 * s, h = 1.5 * s;
  ctx.fillStyle = INK; ctx.fillRect(x0 - 1, -h - 1, 16.5 * s + 2, h * 2 + 2);
  // (each part in steps: lit along the top, shadowed along the bottom)
  const part = (a: number, b: number, c: string) => {
    ctx.fillStyle = c; ctx.fillRect(x0 + a * s, -h, (b - a) * s, h * 2);
    ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x0 + a * s, -h, (b - a) * s, h * 0.5);
    ctx.fillStyle = dark(c, 0.22); ctx.fillRect(x0 + a * s, h * 0.45, (b - a) * s, h * 0.55);
  };
  part(0, 4, '#D7A86E');
  ctx.fillStyle = '#9C6B3A'; for (let k = 0; k < 4; k++) ctx.fillRect(x0 + (0.5 + k * 0.75) * s, -h * 0.35 + (k % 2) * h * 0.5, 1, 1); // (cork specks)
  part(3.3, 4, '#E8B923');
  part(4, 13, '#F5F5F0');
  ctx.fillStyle = '#C9C2B8'; ctx.fillRect(x0 + 12.4 * s, -h, 0.6 * s, h * 2); // (charring)
  part(13, 14.5, '#8A8580');
  ctx.fillStyle = '#5A5550'; ctx.fillRect(x0 + 13.4 * s, -h * 0.6, 1, 1); ctx.fillRect(x0 + 13.9 * s, h * 0.2, 1, 1);
  const hot = frame % 10 < 5 ? 1 : 0;
  ctx.fillStyle = FIRE_RAMP[1 + hot]; ctx.fillRect(x0 + 14.5 * s, -h, 2 * s, h * 2);
  ctx.fillStyle = FIRE_RAMP[2 + hot]; ctx.fillRect(x0 + 14.8 * s, -h * 0.6, 1.5 * s, h * 1.2);
  ctx.fillStyle = FIRE_RAMP[4 + hot]; ctx.fillRect(x0 + 15.2 * s, -h * 0.25, 0.7 * s, h * 0.5);
  ctx.restore();
};

export const drawFlyingCigarette = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  if (p.isTased) {
    // (a ring of current round it: a faint wide band under a hard bright line, sparks jumping off it)
    const r = 30 + Math.random() * 6;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#E0FFFF';
    for (let k = 0; k < 4; k++) { const a = Math.random() * Math.PI * 2; ctx.fillRect(Math.round(cx + Math.cos(a) * (r + 3)) - 1, Math.round(cy + Math.sin(a) * (r + 3)) - 1, 2, 2); }
    ctx.restore();
  }
  // Drawn bigger than the one in his mouth so you can spot (and zap) it; the ember's glow round it in stepped rings
  ctx.save();
  ctx.translate(cx, cy);
  const pulse = 1 + Math.sin(frame * 0.4) * 0.15;
  steppedGlow(ctx, 0, 0, 26 * pulse, '#FF7043', 0.45, 0.12, 4);
  drawTumblingCigarette(ctx, p.isTased ? (Math.random() - 0.5) : frame * 0.25, frame, 2.8);
  ctx.restore();
};

/** Crackling sparks and a cooldown bar over Meathead while his taser is overloaded. */
export const drawTaserOverload = (ctx: CanvasRenderingContext2D, player: Player, frame: number) => {
  const timer = player.taserOverloadTimer || 0;
  if (timer <= 0) return;
  const x = player.pos.x + player.width / 2, y = player.pos.y - 14;
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - 21, y - 1, 42, 6);
  ctx.fillStyle = '#00E5FF';
  ctx.fillRect(x - 20, y, 40 * (timer / TASER_OVERLOAD_FRAMES), 4);
  if (frame % 4 < 2) {
    const { x: hx, y: hy } = muzzlePoint(player, 'TASER');
    ctx.strokeStyle = '#80DEEA';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    for (let i = 0; i < 3; i++) ctx.lineTo(hx + (Math.random() - 0.5) * 18, hy + (Math.random() - 0.5) * 18);
    ctx.stroke();
  }
  ctx.restore();
};
