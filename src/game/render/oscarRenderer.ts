import { Enemy, Player, Projectile } from '../../types';
import { OSCAR_FLICK_WINDUP, OSCAR_TASER_HOLD_FRAMES, TASER_OVERLOAD_FRAMES } from '../../constants';
import { GameState } from '../state';
import { getOscarLauncher, getOscarMouth, flameStrength } from '../bosses/oscar';

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
    drawFlameTongues(ctx, len, s, c.index, state.frame);
    ctx.restore();
  }
  ctx.restore();
};

const drawFlameTongues = (ctx: CanvasRenderingContext2D, len: number, s: number, seed: number, frame: number) => {
  // Soft glow
  ctx.globalAlpha = 0.18 * s;
  ctx.fillStyle = '#FF6D00';
  ctx.fillRect(-2, -48 * s, len + 4, 48 * s);
  ctx.globalAlpha = 1;

  const tongues = Math.max(2, Math.round(len / 8));
  for (let k = 0; k < tongues; k++) {
    const x = (k + 0.5) * (len / tongues);
    const flicker = Math.sin(frame * 0.45 + seed * 1.7 + k * 2.3);
    const h = s * (24 + 12 * flicker + ((seed + k) % 3) * 4);
    const sway = Math.sin(frame * 0.3 + seed + k) * 3;
    const w = 6;
    ctx.fillStyle = '#E64A19';
    ctx.beginPath();
    ctx.moveTo(x - w, 0);
    ctx.quadraticCurveTo(x - w, -h * 0.5, x + sway, -h);
    ctx.quadraticCurveTo(x + w, -h * 0.5, x + w, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFB300';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.55, 0);
    ctx.quadraticCurveTo(x - w * 0.5, -h * 0.35, x + sway * 0.6, -h * 0.65);
    ctx.quadraticCurveTo(x + w * 0.5, -h * 0.35, x + w * 0.55, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFF59D';
    ctx.fillRect(x - 2, -h * 0.25, 4, h * 0.25);
  }
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

/** Blown-up cigarette: a cartoon soot face with blinking eyes and frazzled smoke. Clears up at the end. */
const drawAshFace = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const fade = Math.min(1, (e.stateTimer || 0) / 30);
  const cx = e.pos.x + e.width / 2, top = e.pos.y;
  ctx.save();
  ctx.globalAlpha = fade;
  // Soot over the whole helmet
  ctx.fillStyle = '#141414';
  ctx.beginPath();
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = 30 + (i % 2 === 0 ? 4 : -2);
    const px = cx + Math.cos(a) * r, py = top + 20 + Math.sin(a) * r * 0.75;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  // Frazzled tufts sticking up
  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    const bx = cx + i * 9;
    ctx.beginPath();
    ctx.moveTo(bx, top);
    ctx.lineTo(bx - 3, top - 7);
    ctx.lineTo(bx + 3, top - 12);
    ctx.lineTo(bx, top - 17 - Math.abs(i) * -2);
    ctx.stroke();
  }
  // Big cartoon eyes (blinking)
  const blink = frame % 45 < 5;
  for (const side of [-1, 1]) {
    const ex = cx + side * 11, ey = top + 18;
    if (blink) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - 6, ey);
      ctx.lineTo(ex + 6, ey);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex, ey, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(ex + Math.sin(frame * 0.2) * 1.5, ey + 1, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Dazed little "o" mouth
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, top + 33, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  drawSmokeWisp(ctx, cx - 14, top - 8, frame);
  drawSmokeWisp(ctx, cx + 12, top - 12, frame + 17);
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
  // Reticle
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
  ctx.rotate(Math.atan2(p.vel.y, p.vel.x));
  // Exhaust flame
  ctx.fillStyle = frame % 2 === 0 ? '#FFEB3B' : '#FF6D00';
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.lineTo(-24 - Math.random() * 8, 0);
  ctx.lineTo(-12, 4);
  ctx.closePath();
  ctx.fill();
  // Body, warhead, fins
  ctx.fillStyle = '#4E5B31';
  ctx.fillRect(-12, -4, 20, 8);
  ctx.fillStyle = '#C62828';
  ctx.beginPath();
  ctx.moveTo(8, -4);
  ctx.lineTo(16, 0);
  ctx.lineTo(8, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#263016';
  ctx.fillRect(-12, -7, 5, 3);
  ctx.fillRect(-12, 4, 5, 3);
  // Oil sloshing out
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-2, 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawFlyingCigarette = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  if (p.isTased) {
    ctx.save();
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, 30 + Math.random() * 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Drawn bigger than the one in his mouth so you can spot (and zap) it
  ctx.save();
  ctx.translate(cx, cy);
  const pulse = 1 + Math.sin(frame * 0.4) * 0.15;
  ctx.fillStyle = 'rgba(255, 112, 67, 0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
  ctx.fill();
  drawCigarette(ctx, 0, 0, p.isTased ? (Math.random() - 0.5) : frame * 0.25, frame, 2.8, true);
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
    const hx = player.pos.x + (player.facing === 1 ? player.width : 0), hy = player.pos.y + 25;
    ctx.strokeStyle = '#80DEEA';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    for (let i = 0; i < 3; i++) ctx.lineTo(hx + (Math.random() - 0.5) * 18, hy + (Math.random() - 0.5) * 18);
    ctx.stroke();
  }
  ctx.restore();
};
