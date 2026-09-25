import { Player, WeaponType } from '../../types';
import { COLORS, PLAYER_TERMINAL_VELOCITY, PLAYER_MOVE_SPEED, PLAYER_INVINCIBILITY_FRAMES, SPECIAL_HURT_FRAMES } from '../../constants';
import { GameState } from '../state';

export interface PlayerDrawOptions {
  currentWeapon: WeaponType;
  /** The filth shield aura is only shown during active play. */
  showFilthShield: boolean;
  invincibilityEnabled: boolean;
}

// Palette
const skinTone = '#E0AC69';
const skinShadow = '#C68B45';
const skinHighlight = '#F5D0A9';
const skinVein = '#EF4444';
const pantsColor = '#1E3A8A'; // Navy tactical pants
const pantsShadow = '#172554';
const bootColor = '#18181B'; // Dark combat boots
const bootToe = '#94A3B8'; // Steel toe
const beltColor = '#78350F'; // Leather belt
const beltBuckle = '#FACC15'; // Gold buckle
const wristbandColor = '#09090B'; // Spiked wristband

/** Draws Meathead: effects auras, then body layers back-to-front, then the held weapon. */
export const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player, state: GameState, { currentWeapon, showFilthShield, invincibilityEnabled }: PlayerDrawOptions) => {
  if (state.deathTimer > 0) return;
  const animFrame = state.playerAnimFrame;
  ctx.save();

  // 1. Filth Shield Aura
  if (p.filthShieldTimer && p.filthShieldTimer > 0 && !state.victoryString && showFilthShield) {
    ctx.save();
    const pulse = Math.sin(animFrame * 0.15) * 0.2;
    ctx.globalAlpha = 0.55 + pulse;
    ctx.fillStyle = '#ADFF2F';
    ctx.beginPath();
    ctx.arc(p.pos.x + p.width / 2, p.pos.y + p.height / 2, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 4;
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const bx = p.pos.x + p.width / 2 + Math.cos(animFrame * 0.1 + i * 2) * 32;
      const by = p.pos.y + p.height / 2 + Math.sin(animFrame * 0.1 + i * 2) * 32;
      ctx.fillStyle = '#C5E1A5';
      ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // 2. Invincibility / Hurt Flicker
  const isFlicker = (p.invincibilityTimer > 0 || invincibilityEnabled) && Math.floor(animFrame / 2) % 2 === 0;
  if (isFlicker) {
    ctx.globalAlpha = 0.45;
  }

  drawGroundShadow(ctx, p, state);
  // White flash for the first few frames of taking damage
  if (p.hurtTimer && p.hurtTimer > PLAYER_INVINCIBILITY_FRAMES - 6) ctx.filter = 'brightness(2.4) saturate(0.3)';

  // Recovery animation after being hit mid-special (0 -> 1)
  const hurtT = p.hurtForm && p.hurtFormTimer ? 1 - p.hurtFormTimer / SPECIAL_HURT_FRAMES : -1;

  // Animation States
  const isHurt = p.pushbackTimer > 0 || (p.invincibilityTimer > 40) || hurtT >= 0;
  // A crouch slide has its own pose (drawSlideTackle), not the shoulder-charge afterimages
  const isCharging = p.isCharging && !p.isSliding;
  const isUppercutting = p.isUppercutting;
  const isDivekicking = !!p.isDivekicking;
  const isDucking = p.isDucking;
  const isAirborne = !p.isGrounded;
  const isWalking = p.isGrounded && Math.abs(p.vel.x) > 0.4 && !isCharging && !isDucking && !isDivekicking;
  const isIdle = p.isGrounded && !isWalking && !isCharging && !isDucking && !isUppercutting && !isDivekicking && !isHurt;

  // 3. Charging Afterimages & Energy Trails
  if (isCharging) {
    ctx.save();
    for (let trail = 1; trail <= 3; trail++) {
      const tX = p.pos.x + p.width / 2 - p.facing * trail * 16;
      const tY = p.pos.y + p.height;
      ctx.save();
      ctx.translate(tX, tY);
      ctx.scale(p.facing, 1);
      ctx.globalAlpha = 0.35 / trail;
      ctx.fillStyle = trail % 2 === 0 ? '#EF4444' : '#F59E0B';
      // Afterimage silhouette
      ctx.beginPath();
      ctx.ellipse(0, -32, 22, 34, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Speed streaks
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2;
    for (let s = 0; s < 4; s++) {
      const sy = p.pos.y + 12 + s * 14;
      const sx = p.pos.x + (p.facing === 1 ? -15 : p.width + 15);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - p.facing * (20 + (animFrame * 7 + s * 11) % 25), sy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. Uppercutting Vapor & Upward Energy Cone
  if (isUppercutting) {
    ctx.save();
    const grad = ctx.createLinearGradient(0, p.pos.y + p.height, 0, p.pos.y - 40);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
    grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.3)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(p.pos.x - 10, p.pos.y + p.height);
    ctx.lineTo(p.pos.x + p.width / 2, p.pos.y - 35);
    ctx.lineTo(p.pos.x + p.width + 10, p.pos.y + p.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 5. Divekick Energy Trails & 60-degree Foot Aura
  if (isDivekicking) {
    ctx.save();
    for (let trail = 1; trail <= 3; trail++) {
      const tX = p.pos.x + p.width / 2 - p.facing * trail * 10;
      const tY = p.pos.y + p.height / 2 - trail * 16;
      ctx.save();
      ctx.translate(tX, tY);
      ctx.scale(p.facing, 1);
      ctx.globalAlpha = 0.4 / trail;
      ctx.fillStyle = trail % 2 === 0 ? '#EF4444' : '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 30, 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Speed streaks along 60 degree vector
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2.5;
    for (let s = 0; s < 4; s++) {
      const sx = p.pos.x + (p.facing === 1 ? -10 : p.width + 10) - p.facing * s * 8;
      const sy = p.pos.y - s * 14;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - p.facing * 20, sy - 34);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Set local coordinate frame: (0, 0) is at player feet center
  const anchorX = p.pos.x + p.width / 2;
  const anchorY = p.pos.y + p.height;
  ctx.save();
  ctx.translate(anchorX, anchorY);
  ctx.scale(p.facing, 1);

  // Squash on landing, stretch on take-off and when moving fast vertically
  const isSpecial = p.isCharging || p.isUppercutting || !!p.isDivekicking;
  const airStretch = !p.isGrounded && !isSpecial ? Math.min(1, Math.abs(p.vel.y) / PLAYER_TERMINAL_VELOCITY) * 0.1 : 0;
  const squash = p.squash || 0;
  ctx.scale(1 + squash * 0.25 - airStretch * 0.5, 1 - squash * 0.25 + airStretch);

  if (p.isSliding) {
    drawSlideTackle(ctx, animFrame);
    ctx.restore();
    ctx.restore();
    return;
  }

  // Compute cycle variables
  const idleBreath = Math.sin(animFrame * 0.08) * 1.5;
  const walkPhase = (animFrame * 0.28) % (Math.PI * 2);
  const walkStride = Math.sin(walkPhase);
  const walkBob = Math.abs(Math.sin(walkPhase)) * 3;
  const chargePhase = (animFrame * 0.55) % (Math.PI * 2);
  const chargeStride = Math.sin(chargePhase);

  // Dynamic rotation & vertical offsets based on stance
  let bodyRot = 0;
  let bodyY = 0;
  let spinAroundCenter = false;
  if (hurtT >= 0) {
    const ease = 1 - Math.pow(1 - hurtT, 3);
    switch (p.hurtForm) {
      case 'slide':
        // Knocked flat mid-slide, scrambling back up
        bodyRot = -0.95 * (1 - ease);
        bodyY = 6 * (1 - ease);
        break;
      case 'charge':
        // Torso whips back from the forward lean, then steadies
        bodyRot = hurtT < 0.25 ? 0.35 - 0.9 * (hurtT / 0.25) : -0.55 * Math.pow(1 - (hurtT - 0.25) / 0.75, 2);
        break;
      case 'uppercut':
        // Knocked out of the uppercut into a backflip tumble
        bodyRot = -Math.PI * 2 * (1 - ease);
        spinAroundCenter = true;
        break;
      case 'divekick':
        // Flipped back out of the dive
        bodyRot = hurtT < 0.3 ? 0.95 - 1.65 * (hurtT / 0.3) : -0.7 * Math.pow(1 - (hurtT - 0.3) / 0.7, 2);
        spinAroundCenter = true;
        break;
    }
  } else if (isDivekicking) {
    bodyRot = 0.95; // 55-60 degree downward plummet angle!
    bodyY = -8;
  } else if (isCharging) {
    bodyRot = 0.35; // Aggressive forward bull rush lean
    bodyY = 4;
  } else if (isUppercutting) {
    bodyRot = -0.15; // Dynamic backward launch arch
    bodyY = -6;
  } else if (isHurt) {
    bodyRot = -0.3; // Reeling back in pain/shock
    bodyY = 2;
  } else if (isDucking) {
    bodyRot = 0.05; // Slight forward combat crouch angle
    bodyY = 0; // Feet remain firmly planted on the ground level (0)!
  } else if (isWalking) {
    bodyY = -walkBob;
  } else if (isIdle) {
    bodyY = -idleBreath * 0.5;
  }

  // Lean into the run
  if (isWalking && hurtT < 0) bodyRot += Math.sign(p.vel.x) * p.facing * Math.min(1, Math.abs(p.vel.x) / PLAYER_MOVE_SPEED) * 0.07;

  if (spinAroundCenter) {
    ctx.translate(0, bodyY - 32);
    ctx.rotate(bodyRot);
    ctx.translate(0, 32);
  } else {
    ctx.translate(0, bodyY);
    ctx.rotate(bodyRot);
  }

  // ==========================================
  // LAYER 1: BACK ARM (Off-Hand)
  // ==========================================
  ctx.save();
  if (isDivekicking) {
    // Tucked back defensively for aerodynamic dive
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-14, -36, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-24, -36, 12, 7);
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(-26, -36, 4, 7);
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-28, -32, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (isUppercutting) {
    // Off-hand tucked defensively near chest / ribs
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-8, -35, 7, 0, Math.PI * 2); // Shoulder
    ctx.fill();
    ctx.fillRect(-12, -35, 7, 14); // Forearm
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(-13, -24, 9, 4); // Wristband
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-8, -18, 5, 0, Math.PI * 2); // Clenched fist
    ctx.fill();
  } else if (isCharging) {
    // Trailing backward for aerodynamic speed
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-14, -38, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-26, -38, 14, 8); // Arm back
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(-28, -38, 4, 8);
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-30, -34, 5, 0, Math.PI * 2); // Fist
    ctx.fill();
  } else if (isHurt) {
    // Flailing back in shock
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-16, -36, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-24, -42, 10, 8);
    ctx.beginPath();
    ctx.arc(-26, -42, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (isDucking) {
    // Tucked back defensively near thigh
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-8, -26, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-12, -26, 8, 12);
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(-13, -15, 9, 4);
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(-8, -10, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Idle / Walk pumping arm in opposition
    const armAngle = isWalking ? -walkStride * 0.6 : Math.sin(animFrame * 0.08) * 0.1;
    ctx.save();
    ctx.translate(-6, -40);
    ctx.rotate(armAngle);
    // Shoulder & Bicep
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-5, 0, 9, 14);
    // Forearm & Spiked Wristband
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(-6, 12, 11, 5);
    // Studs
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(-4, 13, 2, 3);
    ctx.fillRect(1, 13, 2, 3);
    // Fist
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(0, 21, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // ==========================================
  // LAYER 2: LEGS & BOOTS
  // ==========================================
  ctx.save();
  if (isDivekicking) {
    // Rear leg bent at knee (tucked aerodynamic)
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-12, -24, 10, 14);
    ctx.fillStyle = bootColor;
    ctx.fillRect(-14, -12, 10, 8);

    // Lead leg thrust straight out forward-downward with steel toe leading
    ctx.fillStyle = pantsColor;
    ctx.save();
    ctx.translate(2, -22);
    ctx.rotate(0.3);
    ctx.fillRect(0, 0, 11, 24); // Extended kicking leg
    ctx.fillStyle = bootColor;
    ctx.fillRect(-2, 22, 15, 9); // Combat boot
    ctx.fillStyle = bootToe;
    ctx.fillRect(6, 23, 7, 7); // Steel toe leading the strike
    ctx.restore();
  } else if (isUppercutting) {
    // Front knee driven high into chest, back leg trailing downward
    // Back leg (straight down)
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-8, -20, 9, 16);
    ctx.fillStyle = bootColor;
    ctx.fillRect(-9, -4, 11, 8);
    ctx.fillStyle = bootToe;
    ctx.fillRect(-3, -2, 6, 6);

    // Front leg (bent high driving upward)
    ctx.fillStyle = pantsColor;
    ctx.save();
    ctx.translate(6, -22);
    ctx.rotate(-0.8);
    ctx.fillRect(0, 0, 10, 16); // Thigh angled up
    ctx.translate(0, 16);
    ctx.rotate(1.4);
    ctx.fillRect(0, 0, 9, 14); // Shin bent down
    ctx.fillStyle = bootColor;
    ctx.fillRect(-1, 12, 12, 7); // Boot flexed
    ctx.fillStyle = bootToe;
    ctx.fillRect(6, 13, 6, 5);
    ctx.restore();
  } else if (isCharging) {
    // Violent forward sprint stride
    const cLeg = chargeStride * 14;
    // Back leg pushing
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-14 - cLeg * 0.5, -20, 10, 14);
    ctx.fillStyle = bootColor;
    ctx.fillRect(-16 - cLeg * 0.5, -6, 12, 6);

    // Front leg driving
    ctx.fillStyle = pantsColor;
    ctx.fillRect(2 + cLeg * 0.5, -20, 10, 14);
    ctx.fillStyle = bootColor;
    ctx.fillRect(4 + cLeg * 0.5, -6, 14, 6);
    ctx.fillStyle = bootToe;
    ctx.fillRect(12 + cLeg * 0.5, -5, 6, 5);
  } else if (isDucking) {
    // Deep martial-arts power squat: boots flat on floor level (y = -6 to 0), thighs flared outward
    // Back thigh
    ctx.fillStyle = pantsShadow;
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(-20, -10);
    ctx.lineTo(-18, -6);
    ctx.lineTo(-8, -6);
    ctx.closePath();
    ctx.fill();

    // Back boot firmly planted on the floor
    ctx.fillStyle = bootColor;
    ctx.fillRect(-20, -6, 14, 6);
    ctx.fillStyle = '#09090B';
    ctx.fillRect(-20, -1, 14, 2);

    // Front thigh
    ctx.fillStyle = pantsColor;
    ctx.beginPath();
    ctx.moveTo(6, -14);
    ctx.lineTo(20, -10);
    ctx.lineTo(18, -6);
    ctx.lineTo(8, -6);
    ctx.closePath();
    ctx.fill();

    // Front boot firmly planted on the floor
    ctx.fillStyle = bootColor;
    ctx.fillRect(6, -6, 15, 6);
    ctx.fillStyle = bootToe;
    ctx.fillRect(15, -5, 6, 5);
    ctx.fillStyle = '#09090B';
    ctx.fillRect(6, -1, 15, 2);
  } else if (isAirborne) {
    // Air state: knees tucked slightly
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-9, -20, 9, 14);
    ctx.fillStyle = bootColor;
    ctx.fillRect(-10, -6, 11, 7);

    ctx.fillStyle = pantsColor;
    ctx.fillRect(2, -22, 10, 15);
    ctx.fillStyle = bootColor;
    ctx.fillRect(2, -7, 13, 7);
    ctx.fillStyle = bootToe;
    ctx.fillRect(9, -6, 6, 5);
  } else if (isHurt) {
    // Staggered backwards
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-14, -20, 10, 16);
    ctx.fillStyle = bootColor;
    ctx.fillRect(-16, -4, 13, 6);

    ctx.fillStyle = pantsColor;
    ctx.fillRect(2, -22, 10, 18);
    ctx.fillStyle = bootColor;
    ctx.fillRect(3, -4, 13, 6);
    ctx.fillStyle = bootToe;
    ctx.fillRect(10, -3, 6, 5);
  } else if (isWalking) {
    // Smooth 2-legged walking cycle with knee bend & heel strike
    // Back leg
    ctx.fillStyle = pantsShadow;
    ctx.save();
    ctx.translate(-4, -20);
    ctx.rotate(-walkStride * 0.5);
    ctx.fillRect(-5, 0, 9, 14);
    ctx.fillStyle = bootColor;
    ctx.fillRect(-6, 12, 12, 7);
    ctx.restore();

    // Front leg
    ctx.fillStyle = pantsColor;
    ctx.save();
    ctx.translate(4, -20);
    ctx.rotate(walkStride * 0.5);
    ctx.fillRect(-4, 0, 10, 14);
    ctx.fillStyle = bootColor;
    ctx.fillRect(-5, 12, 14, 7);
    ctx.fillStyle = bootToe;
    ctx.fillRect(3, 13, 6, 5);
    ctx.restore();
  } else {
    // Idle grounded solid stance
    ctx.fillStyle = pantsShadow;
    ctx.fillRect(-10, -22, 10, 16);
    ctx.fillStyle = bootColor;
    ctx.fillRect(-11, -6, 12, 7);

    ctx.fillStyle = pantsColor;
    ctx.fillRect(2, -22, 10, 16);
    ctx.fillStyle = bootColor;
    ctx.fillRect(2, -6, 14, 7);
    ctx.fillStyle = bootToe;
    ctx.fillRect(10, -5, 6, 5);
    // Tread grips
    ctx.fillStyle = '#09090B';
    ctx.fillRect(2, 0, 14, 2);
  }
  ctx.restore();

  // ==========================================
  // LAYER 3: WEIGHTLIFTING BELT
  // ==========================================
  ctx.save();
  const beltY = isDucking ? -16 : -27;
  const beltH = isDucking ? 6 : 7;
  // Heavy brown leather strap
  ctx.fillStyle = beltColor;
  ctx.fillRect(-13, beltY, 26, beltH);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(-13, beltY, 26, beltH);
  // Heavy gold weightlifting buckle
  ctx.fillStyle = beltBuckle;
  ctx.fillRect(-5, beltY - 1, 10, beltH + 2);
  ctx.strokeStyle = '#B45309';
  ctx.strokeRect(-5, beltY - 1, 10, beltH + 2);
  // Buckle cutout center
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-2, beltY + 1, 4, beltH - 2);
  // Silver studs
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(-10, beltY + 2, 2, 2);
  ctx.fillRect(8, beltY + 2, 2, 2);
  ctx.restore();

  // ==========================================
  // LAYER 4: TORSO, CHISELED ABS & BULGING PECS
  // ==========================================
  ctx.save();
  const torsoTop = isDucking ? -36 : -50;
  const torsoHeight = isDucking ? 21 : 24;
  const pecY = isDucking ? -34 : -48;
  // Torso Base
  ctx.fillStyle = skinTone;
  ctx.fillRect(-14, torsoTop, 28, torsoHeight);

  // Chiseled 6-Pack Abs (compacted during crouch)
  ctx.fillStyle = skinShadow;
  // Linea alba (center vertical divider)
  ctx.fillRect(-0.75, torsoTop + 9, 1.5, isDucking ? 10 : 13);
  // Horizontal ab dividers
  ctx.fillRect(-8, torsoTop + 13, 16, 1.2);
  if (!isDucking) {
    ctx.fillRect(-7, -31, 14, 1.2);
  }
  // Six distinct rectus abdominis muscle blocks
  ctx.fillStyle = skinHighlight;
  ctx.fillRect(-6, torsoTop + 9.5, 4.5, 2.8);
  ctx.fillRect(1.5, torsoTop + 9.5, 4.5, 2.8);
  ctx.fillRect(-5.5, torsoTop + 14, 4, 3);
  ctx.fillRect(1.5, torsoTop + 14, 4, 3);
  if (!isDucking) {
    ctx.fillRect(-5, -30, 4, 2.5);
    ctx.fillRect(1, -30, 4, 2.5);
  }

  // Bulging Pectoral Chest Muscles
  ctx.fillStyle = skinTone;
  // Left pec
  ctx.beginPath();
  ctx.roundRect(-13, pecY, 12, isDucking ? 8.5 : 10, [3, 1, 3, 4]);
  ctx.fill();
  // Right pec
  ctx.beginPath();
  ctx.roundRect(1, pecY, 12, isDucking ? 8.5 : 10, [1, 3, 4, 3]);
  ctx.fill();

  // Pec separation shadow & under-pec cleft
  ctx.fillStyle = skinShadow;
  ctx.fillRect(-0.75, pecY, 1.5, isDucking ? 8.5 : 10);
  ctx.fillRect(-13, pecY + (isDucking ? 7.5 : 9), 26, 1.5);
  // Upper pec highlights
  ctx.fillStyle = skinHighlight;
  ctx.fillRect(-11, pecY + 1.5, 8, 2);
  ctx.fillRect(3, pecY + 1.5, 8, 2);

  // Trapezius muscles rising behind neck
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.moveTo(-12, torsoTop + 2);
  ctx.lineTo(-6, torsoTop - 6);
  ctx.lineTo(6, torsoTop - 6);
  ctx.lineTo(12, torsoTop + 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ==========================================
  // LAYER 5: HEAD, GLOWING FACE & SCULPTED JAW
  // ==========================================
  ctx.save();
  const headX = isDucking ? 2 : (isCharging ? 6 : (isHurt ? -4 : (isUppercutting ? -1 : (isDivekicking ? 4 : 0))));
  const headY = isDucking ? -38 : (isUppercutting ? -60 : (isCharging ? -48 : (isDivekicking ? -48 : -54)));

  // Granite Square Jaw & Face base
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.roundRect(headX - 10, headY - 12, 20, 20, [4, 4, 3, 3]);
  ctx.fill();

  // 5 O'clock Stubble Shadow along jawline
  ctx.fillStyle = 'rgba(120, 53, 15, 0.25)';
  ctx.fillRect(headX - 9, headY + 1, 18, 7);

  // Military Buzzcut / Flat-Top Hair
  ctx.fillStyle = '#18181B';
  // Flat top
  ctx.fillRect(headX - 10, headY - 16, 20, 5);
  // Temple fade sides
  ctx.fillRect(headX - 11, headY - 14, 2, 7);
  ctx.fillRect(headX + 9, headY - 14, 2, 7);

  // Forehead Bulging Rage Vein
  ctx.strokeStyle = skinVein;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(headX - 6, headY - 10);
  ctx.lineTo(headX - 3, headY - 8);
  ctx.lineTo(headX - 4, headY - 5);
  ctx.stroke();

  // Heavy Angry Eyebrows
  ctx.fillStyle = '#09090B';
  if (isHurt) {
    // Arched high in shock/pain
    ctx.fillRect(headX - 8, headY - 9, 6, 2.5);
    ctx.fillRect(headX + 2, headY - 9, 6, 2.5);
  } else {
    // Intensely furrowed downward v-shape
    ctx.beginPath();
    ctx.moveTo(headX - 8, headY - 9);
    ctx.lineTo(headX - 1, headY - 6);
    ctx.lineTo(headX - 1, headY - 4);
    ctx.lineTo(headX - 8, headY - 7);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(headX + 8, headY - 9);
    ctx.lineTo(headX + 1, headY - 6);
    ctx.lineTo(headX + 1, headY - 4);
    ctx.lineTo(headX + 8, headY - 7);
    ctx.fill();
  }

  // Eyes
  const eyeY = headY - 4;
  const lEyeX = headX - 5;
  const rEyeX = headX + 4;

  if (p.bossKillSatisfactionTimer > 0) {
    // Glowing Demonic Red Eyes of Doom
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(lEyeX, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rEyeX, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(lEyeX, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rEyeX, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
  } else if (isHurt) {
    // Wide shocked bloodshot eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(lEyeX, eyeY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rEyeX, eyeY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#DC2626';
    ctx.beginPath(); ctx.arc(lEyeX, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rEyeX, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
  } else {
    // Narrowed badass squint (with the occasional blink while idle)
    if (isIdle && animFrame % 190 < 7) {
      ctx.fillStyle = '#09090B';
      ctx.fillRect(lEyeX - 2.5, eyeY, 5, 1.2);
      ctx.fillRect(rEyeX - 2.5, eyeY, 5, 1.2);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(lEyeX - 2.5, eyeY - 1.5, 5, 3);
      ctx.fillRect(rEyeX - 2.5, eyeY - 1.5, 5, 3);
      ctx.fillStyle = '#09090B';
      ctx.fillRect(lEyeX, eyeY - 1, 2.5, 2.5); // Pupil focused forward
      ctx.fillRect(rEyeX, eyeY - 1, 2.5, 2.5);
    }
  }

  // Mouth / Gritted Teeth
  const mouthY = headY + 3;
  if (isUppercutting) {
    // Wide open mouth roaring up to the heavens
    ctx.fillStyle = '#450A0A';
    ctx.beginPath();
    ctx.ellipse(headX, mouthY + 1, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX - 3, mouthY - 1, 6, 2); // Top teeth
  } else if (isHurt) {
    // Grimacing yelling mouth askew
    ctx.fillStyle = '#18181B';
    ctx.fillRect(headX - 6, mouthY, 12, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX - 5, mouthY + 0.5, 10, 1.5);
    // Sweat / pain droplets flying off head
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath(); ctx.arc(headX - 12, headY - 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headX - 8, headY - 14, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (p.killSatisfactionTimer > 0 || state.victoryString !== "") {
    // Victorious grin with chewing cigar!
    ctx.fillStyle = '#09090B';
    ctx.fillRect(headX - 6, mouthY, 12, 3.5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX - 5, mouthY, 10, 3);
    // Tooth lines
    ctx.fillStyle = '#09090B';
    ctx.fillRect(headX - 2, mouthY, 0.8, 3);
    ctx.fillRect(headX + 1, mouthY, 0.8, 3);
    // Victory Cigar clamped in teeth
    ctx.fillStyle = '#78350F';
    ctx.fillRect(headX + 4, mouthY - 1, 9, 3);
    ctx.fillStyle = '#EF4444'; // Glowing red cherry tip
    ctx.fillRect(headX + 13, mouthY - 1, 2.5, 3);
    // Smoke puff
    if (animFrame % 10 < 5) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath(); ctx.arc(headX + 17, mouthY - 3, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    // Clenched teeth badass snarl
    ctx.fillStyle = '#18181B';
    ctx.fillRect(headX - 6, mouthY, 12, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX - 5, mouthY + 0.5, 10, 2);
    // Teeth separator lines
    ctx.fillStyle = '#18181B';
    ctx.fillRect(headX - 2, mouthY + 0.5, 0.8, 2);
    ctx.fillRect(headX + 1, mouthY + 0.5, 0.8, 2);
  }
  ctx.restore();

  // ==========================================
  // LAYER 6: LEAD ARM (Main Arm & Weapon)
  // ==========================================
  ctx.save();
  if (isDivekicking) {
    // Lead arm tucked tight across chest for aerodynamic dive
    ctx.fillStyle = skinTone;
    ctx.beginPath(); ctx.arc(4, -40, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-6, -42, 12, 8);
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(-8, -42, 4, 8);
    ctx.fillStyle = skinTone;
    ctx.beginPath(); ctx.arc(-11, -38, 5.5, 0, Math.PI * 2); ctx.fill();
  } else if (isUppercutting) {
    // DRAGON PUNCH / SHORYUKEN UPPERCUT POSE!
    // Lead arm launched straight up to the sky
    const fistX = 4;
    const fistY = -78;

    // Arm stretching straight up
    ctx.fillStyle = skinTone;
    // Cannonball delt
    ctx.beginPath(); ctx.arc(6, -46, 8.5, 0, Math.PI * 2); ctx.fill();
    // Bicep / Tricep vertical pillar
    ctx.fillRect(2, -66, 9, 22);
    // Vein bulging on bicep
    ctx.strokeStyle = skinVein;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(4, -52); ctx.lineTo(7, -58); ctx.lineTo(5, -64); ctx.stroke();

    // Spiked wristband
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(1, -70, 11, 5);
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(3, -69, 2, 3);
    ctx.fillRect(7, -69, 2, 3);

    // Huge clenched skyward fist
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(fistX + 2.5, fistY, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 1.2;
    // Knuckles facing forward
    ctx.strokeRect(fistX - 3, fistY - 6, 11, 7);

    // White/cyan spiraling speed streaks around fist
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fistX + 2.5, fistY + 12, 14, 0, Math.PI);
    ctx.stroke();
  } else if (isCharging) {
    // SHOULDER RAMMING POSE!
    // Shoulder jutted violently forward like a bull ram
    const ramX = 14;
    const ramY = -44;
    // Massive cannonball delt
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(ramX, ramY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skinHighlight;
    ctx.beginPath();
    ctx.arc(ramX + 3, ramY - 3, 5, 0, Math.PI * 2);
    ctx.fill();
    // Bicep flexed tightly against chest
    ctx.fillStyle = skinShadow;
    ctx.fillRect(4, ramY - 2, 12, 8);
    // Spiked wristband
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(2, ramY + 3, 9, 5);
    // Clenched fist
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(6, ramY + 11, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (isHurt) {
    // Lead arm knocked back
    ctx.fillStyle = skinTone;
    ctx.beginPath(); ctx.arc(6, -40, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(3, -34, 8, 12);
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(2, -22, 10, 4);
    ctx.fillStyle = skinTone;
    ctx.beginPath(); ctx.arc(7, -16, 5.5, 0, Math.PI * 2); ctx.fill();
  } else {
    // Walking / Standing / Ducking Aiming Pose
    const armPump = isWalking ? walkStride * 8 : 0;
    const armBaseX = isDucking ? 10 : 8;
    const armBaseY = isDucking ? -26 : -42;

    // Shoulder Delt
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(armBaseX, armBaseY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skinHighlight;
    ctx.beginPath();
    ctx.arc(armBaseX + 2, armBaseY - 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Upper arm / Forearm extending forward to hold weapon
    ctx.fillStyle = skinTone;
    ctx.fillRect(armBaseX - 2, armBaseY + 2, 12 + armPump * 0.3, 8);
    // Vein on bicep
    ctx.strokeStyle = skinVein;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(armBaseX, armBaseY + 3);
    ctx.lineTo(armBaseX + 5, armBaseY + 6);
    ctx.stroke();

    // Spiked wristband
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(armBaseX + 8 + armPump * 0.3, armBaseY + 1, 5, 10);
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(armBaseX + 9 + armPump * 0.3, armBaseY + 3, 2, 2);
    ctx.fillRect(armBaseX + 9 + armPump * 0.3, armBaseY + 7, 2, 2);

    // Hand / Fist gripping weapon
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(armBaseX + 15 + armPump * 0.3, armBaseY + 6, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Render Equipped Weapon in Meathead's lead hand!
    const wpnX = armBaseX + 10 + armPump * 0.3;
    const wpnY = armBaseY + 2;

    ctx.save();
    if (currentWeapon === 'GUN') {
      // Heavy pump-action shotgun
      ctx.fillStyle = '#27272A';
      ctx.fillRect(wpnX, wpnY, 22, 7);
      ctx.fillStyle = '#71717A';
      ctx.fillRect(wpnX + 6, wpnY + 4, 8, 4); // Pump
      ctx.fillStyle = '#52525B';
      ctx.fillRect(wpnX + 22, wpnY + 1, 4, 3); // Muzzle
    } else if (currentWeapon === 'BOULDER') {
      // Craggy heavy rock
      ctx.fillStyle = '#854D0E';
      ctx.beginPath();
      ctx.arc(wpnX + 12, wpnY - 4, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (currentWeapon === 'SHOTGUN') {
      // Cryo shotgun
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(wpnX, wpnY, 20, 8);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(wpnX + 12, wpnY - 2, 4, 4);
      ctx.fillStyle = '#E0F2FE';
      ctx.fillRect(wpnX + 18, wpnY + 2, 4, 3);
    } else if (currentWeapon === 'NEEDLES') {
      // Syringe dart launcher
      ctx.fillStyle = COLORS.PROJECTILE_DART;
      ctx.fillRect(wpnX, wpnY, 20, 7);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(wpnX + 18, wpnY + 1, 6, 5);
    } else if (currentWeapon === 'FLAMETHROWER') {
      // Industrial flamethrower
      ctx.save();
      ctx.translate(wpnX + 4, wpnY + 4);
      ctx.rotate(p.flameAngle || 0);
      ctx.fillStyle = '#3F3F46';
      ctx.fillRect(0, -4, 24, 9);
      ctx.fillStyle = '#EA580C';
      ctx.fillRect(22, -2, 5, 5); // Pilot nozzle
      ctx.restore();
    } else if (currentWeapon === 'SLUDGE') {
      // Toxic sludge launcher
      ctx.fillStyle = '#14532D';
      ctx.fillRect(wpnX, wpnY, 22, 10);
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(wpnX + 16, wpnY + 2, 6, 6);
    } else if (currentWeapon === 'TSUNAMI') {
      // Hydro cannon
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(wpnX, wpnY, 24, 10);
      ctx.fillStyle = '#93C5FD';
      ctx.fillRect(wpnX + 18, wpnY + 2, 5, 6);
    } else if (currentWeapon === 'TASER') {
      // High voltage stun gun
      ctx.fillStyle = '#18181B';
      ctx.fillRect(wpnX, wpnY, 22, 8);
      ctx.fillStyle = COLORS.TASER_BOLT;
      ctx.fillRect(wpnX + 18, wpnY + 1, 6, 6);
    } else if (currentWeapon === 'OIL_ROCKET') {
      // Heavy military rocket launcher
      ctx.fillStyle = '#18181B';
      ctx.fillRect(wpnX - 4, wpnY - 2, 28, 10);
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(wpnX + 24, wpnY - 2);
      ctx.lineTo(wpnX + 32, wpnY + 3);
      ctx.lineTo(wpnX + 24, wpnY + 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();

  // Restore local transform
  ctx.restore();

  // Pain sparks when knocked out of a special move
  if (hurtT >= 0 && hurtT < 0.5) {
    ctx.save();
    ctx.globalAlpha = 1 - hurtT * 2;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + hurtT * 3;
      const r = 18 + hurtT * 30;
      const sx = p.pos.x + p.width / 2 + Math.cos(a) * r;
      const sy = p.pos.y + 14 + Math.sin(a) * r * 0.6;
      ctx.fillStyle = i % 2 ? '#FFFFFF' : '#EF4444';
      ctx.fillRect(sx - 3, sy - 1, 6, 2);
      ctx.fillRect(sx - 1, sy - 3, 2, 6);
    }
    ctx.restore();
  }

  // 7. Stun Stars Effect when Stunned
  if (state.playerStunTimer > 0) {
    ctx.save();
    const starAngle = animFrame * 0.2;
    for (let s = 0; s < 3; s++) {
      const sx = p.pos.x + p.width / 2 + Math.cos(starAngle + s * 2.1) * 22;
      const sy = p.pos.y - 12 + Math.sin(starAngle + s * 2.1) * 8;
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
};

/**
 * Slide tackle (crouch + charge): leaning way back, lead boot skimming the
 * floor steel-toe first, back leg tucked under, one palm planted behind.
 * Drawn in the player's local frame: (0,0) is between the feet, +x is forward.
 */
const drawSlideTackle = (ctx: CanvasRenderingContext2D, frame: number) => {
  const rattle = frame % 4 < 2 ? 0 : 1; // floor vibration
  ctx.save();
  ctx.translate(0, rattle);

  // Dust cloud kicked up behind
  for (let i = 0; i < 5; i++) {
    const dx = -30 - ((frame * 3 + i * 13) % 40);
    const r = 5 + ((frame + i * 7) % 6);
    ctx.fillStyle = `rgba(190, 175, 150, ${0.55 - ((frame * 3 + i * 13) % 40) / 90})`;
    ctx.beginPath();
    ctx.arc(dx, -4 - (i % 2) * 5, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Back arm: palm planted on the floor behind for balance
  ctx.save();
  ctx.fillStyle = skinShadow;
  ctx.beginPath(); ctx.arc(-24, -30, 7, 0, Math.PI * 2); ctx.fill();
  ctx.translate(-24, -30);
  ctx.rotate(0.45);
  ctx.fillRect(-4, 0, 8, 22);
  ctx.fillStyle = wristbandColor;
  ctx.fillRect(-5, 16, 10, 4);
  ctx.fillStyle = skinShadow;
  ctx.beginPath(); ctx.ellipse(0, 25, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Back leg tucked under
  ctx.fillStyle = pantsShadow;
  ctx.beginPath();
  ctx.moveTo(-10, -15); ctx.lineTo(4, -10); ctx.lineTo(3, -3); ctx.lineTo(-10, -7);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -8); ctx.lineTo(-12, -5); ctx.lineTo(-12, 0); ctx.lineTo(3, -2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = bootColor;
  ctx.fillRect(-22, -6, 11, 6);

  // Lead leg straight out along the floor, steel toe first
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.moveTo(-8, -17); ctx.lineTo(22, -10); ctx.lineTo(22, -1); ctx.lineTo(-6, -6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = bootColor;
  ctx.fillRect(20, -11, 16, 10);
  ctx.fillStyle = bootToe;
  ctx.fillRect(30, -10, 7, 8);
  ctx.fillStyle = '#09090B';
  ctx.fillRect(20, -2, 17, 2);

  // Sparks off the steel toe
  if (frame % 3 !== 0) {
    ctx.fillStyle = frame % 2 === 0 ? '#FDE047' : '#FB923C';
    for (let s = 0; s < 3; s++) {
      ctx.fillRect(38 + ((frame * 5 + s * 7) % 12), -3 - ((frame + s * 3) % 6), 3, 2);
    }
  }

  // Torso leaning way back from the hips, belt at the waist
  ctx.save();
  ctx.translate(-8, -15);
  ctx.rotate(-0.9);
  ctx.fillStyle = skinTone;
  ctx.fillRect(-13, -26, 26, 26);
  ctx.fillStyle = skinShadow;
  ctx.fillRect(-0.75, -17, 1.5, 13);
  ctx.fillRect(-8, -12, 16, 1.2);
  ctx.fillRect(-7, -7, 14, 1.2);
  ctx.fillStyle = skinTone;
  ctx.beginPath(); ctx.roundRect(-12, -25, 11, 9, [3, 1, 3, 4]); ctx.fill();
  ctx.beginPath(); ctx.roundRect(1, -25, 11, 9, [1, 3, 4, 3]); ctx.fill();
  ctx.fillStyle = skinShadow;
  ctx.fillRect(-12, -17, 24, 1.5);
  ctx.fillStyle = skinHighlight;
  ctx.fillRect(-10, -23.5, 7, 2);
  ctx.fillRect(3, -23.5, 7, 2);
  ctx.fillStyle = beltColor;
  ctx.fillRect(-13, -3, 26, 6);
  ctx.fillStyle = beltBuckle;
  ctx.fillRect(-5, -4, 10, 8);
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-2, -2, 4, 4);
  ctx.restore();

  // Head up and forward, yelling
  const hx = -27, hy = -42;
  ctx.fillStyle = skinTone;
  ctx.beginPath(); ctx.roundRect(hx - 10, hy - 12, 20, 20, [4, 4, 3, 3]); ctx.fill();
  ctx.fillStyle = 'rgba(120, 53, 15, 0.25)';
  ctx.fillRect(hx - 9, hy + 1, 18, 7);
  ctx.fillStyle = '#18181B';
  ctx.fillRect(hx - 10, hy - 16, 20, 5);
  ctx.fillRect(hx - 11, hy - 14, 2, 7);
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy - 9); ctx.lineTo(hx - 1, hy - 6); ctx.lineTo(hx - 1, hy - 4); ctx.lineTo(hx - 8, hy - 7);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx + 8, hy - 9); ctx.lineTo(hx + 1, hy - 6); ctx.lineTo(hx + 1, hy - 4); ctx.lineTo(hx + 8, hy - 7);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(hx - 7.5, hy - 5.5, 5, 3);
  ctx.fillRect(hx + 1.5, hy - 5.5, 5, 3);
  ctx.fillStyle = '#09090B';
  ctx.fillRect(hx - 5, hy - 5, 2.5, 2.5);
  ctx.fillRect(hx + 4, hy - 5, 2.5, 2.5);
  ctx.fillStyle = '#450A0A';
  ctx.beginPath(); ctx.ellipse(hx + 1, hy + 4, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(hx - 2, hy + 1.5, 6, 1.5);

  // Lead arm thrust forward, gun leading the slide
  ctx.fillStyle = skinTone;
  ctx.beginPath(); ctx.arc(-18, -34, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-18, -38, 18, 8);
  ctx.fillStyle = wristbandColor;
  ctx.fillRect(-2, -39, 5, 10);
  ctx.fillStyle = skinTone;
  ctx.beginPath(); ctx.arc(6, -34, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#374151';
  ctx.fillRect(8, -39, 15, 6);
  ctx.fillRect(9, -35, 5, 7);

  ctx.restore();
};

/** Soft shadow on the ground below Meathead, shrinking and fading with height. */
const drawGroundShadow = (ctx: CanvasRenderingContext2D, p: Player, state: GameState) => {
  const cx = p.pos.x + p.width / 2;
  const feetY = p.pos.y + p.height;
  let groundY = Infinity;
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.type === 'door' || cx < b.x || cx > b.x + b.w || b.y < feetY - 4) continue;
    groundY = Math.min(groundY, b.y);
  }
  const height = groundY - feetY;
  if (!isFinite(groundY) || height > 320) return;
  const k = 1 - height / 320;
  ctx.save();
  ctx.globalAlpha *= 0.35 * k;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(cx, groundY, p.width * 0.65 * (0.5 + 0.5 * k), 5 * (0.5 + 0.5 * k), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
