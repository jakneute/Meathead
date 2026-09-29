import { Player, WeaponType } from '../../../types';
import { BOULDER_THROW_FRAMES, COLORS, INITIAL_PLAYER_HEALTH, PLAYER_TERMINAL_VELOCITY, PLAYER_MOVE_SPEED, PLAYER_INVINCIBILITY_FRAMES, SPECIAL_HURT_FRAMES } from '../../../constants';
import { peeProgress } from '../../scenes/victoryPee';
import { SLIDE_HOLD } from '../../combat/muzzle';
import { drawShoulderCharge, drawSwimCharge, drawUppercut, drawDivekick, drawJetskiWheelie, drawJetskiLeap, drawJetskiDive, drawStandingKick, drawPedalLegs, drawLedgeDrop } from './moves';
import { KICK_POSE_FRAMES, LEDGE_DROP_FRAMES } from '../../../constants';
import { GameState } from '../../core/state';
import { beginSprite, endSprite, markEyes, eyesAt } from './spriteOutline';
import { setGore, getGore, smear, drip, drawHeadBlood, drawTorsoBlood, drawLeadArmBlood, drawBeatenUp, bloodDark } from './gore';

export interface PlayerDrawOptions {
  currentWeapon: WeaponType;
  /** The filth shield aura is only shown during active play. */
  showFilthShield: boolean;
  invincibilityEnabled: boolean;
  /** Standing about, bored: the front foot's toe tapping (0 down, 1 up). */
  footTap?: number;
  /** Surfing (on Barry's man, down out of the sky): knees bent low, arms out wide for balance, throwing a shaka, no gun. */
  surf?: boolean;
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
const backArmShade = '#A87038';   // shadow side of the far arm
const stubbleColor = 'rgba(60, 30, 10, 0.35)';
/** Black with soot (a room blown up round him): how long it takes to wear off at the end (frames). */
export const SOOT_FRAMES = 420;
const SOOT_FADE = 120;
/** In a hazmat suit (Tommy's sewer): yellow over all of him, a hood's dark visor over his face. */
const SUIT_TINT = 'rgba(250, 204, 21, 0.78)';

/** Draws Meathead: effects auras, then body layers back-to-front, then the held weapon. */
export const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player, state: GameState, { currentWeapon, showFilthShield, invincibilityEnabled, footTap = 0, surf = false }: PlayerDrawOptions) => {
  if ((state.deathTimer > 0 && !p.headless) || p.hidden) return;
  const animFrame = state.playerAnimFrame;
  setGore(1 - p.health / INITIAL_PLAYER_HEALTH);
  const gore = getGore();
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
  const isFlicker = (p.invincibilityTimer > 0 || invincibilityEnabled) && !p.inCutscene && Math.floor(animFrame / 2) % 2 === 0;
  if (isFlicker) {
    ctx.globalAlpha = 0.45;
  }

  drawGroundShadow(ctx, p, state);
  // White flash for the first few frames of taking damage
  if (p.hurtTimer && p.hurtTimer > PLAYER_INVINCIBILITY_FRAMES - 6) ctx.filter = 'brightness(2.4) saturate(0.3)';

  // Recovery animation after being hit mid-special (0 -> 1)
  const hurtT = p.hurtForm && p.hurtFormTimer ? 1 - p.hurtFormTimer / SPECIAL_HURT_FRAMES : -1;

  // Animation States
  // (firing the LMG he doesn't flinch: he just flashes and keeps it going)
  const lmgGrit = p.currentWeapon === 'LMG' && p.shootCooldown > 0;
  const isHurt = !lmgGrit && (p.pushbackTimer > 0 || (p.invincibilityTimer > 40) || hurtT >= 0);
  // A crouch slide has its own pose (drawSlideTackle), not the shoulder-charge afterimages
  const isCharging = p.isCharging && !p.isSliding;
  const isUppercutting = p.isUppercutting;
  const isDivekicking = !!p.isDivekicking;
  const isDucking = p.isDucking || surf;
  const isAirborne = !p.isGrounded;
  // In the water (off the bottom): arms stroking, legs kicking; freestyle when he's going somewhere, treading water when he isn't
  const isSwimming = !!p.swimming && !p.isGrounded && hurtT < 0;
  // (stretched out flat he's a lot longer than he is stood up: up against a wall or a pipe, he treads water instead,
  // so he never pokes through it)
  const swimRoom = { x: p.pos.x - 30, y: p.pos.y + 8, w: p.width + 60, h: p.height - 16 };
  const cramped = isSwimming && state.blocks.some(b => b.type !== 'pit' && !b.oneWay && b.x < swimRoom.x + swimRoom.w && b.x + b.w > swimRoom.x && b.y < swimRoom.y + swimRoom.h && b.y + b.h > swimRoom.y);
  const swimMoving = isSwimming && Math.abs(p.vel.x) > 0.8 && !cramped;
  // (on skis he glides in a stance rather than running)
  const isWalking = !p.skiing && p.isGrounded && Math.abs(p.vel.x) > 0.4 && !isCharging && !isDucking && !isDivekicking;
  const isIdle = p.isGrounded && !isWalking && !isCharging && !isDucking && !isUppercutting && !isDivekicking && !isHurt;
  // Victory lap after a weakness kill: weapon put away, and both hands on the job while he pisses
  const isUnarmed = !!state.bossCorpse && !!state.victoryString;
  const isRelieving = isUnarmed && peeProgress(p.peeTimer).out;
  // Grim determination after a charge that didn't kill (like the Doom guy's rampage face)
  const isAngry = !!p.angryTimer && p.angryTimer > 0 && !isHurt && !isRelieving;
  // Sat astride the jet ski: knees forward, off-hand on the handlebars (the gun hand's free)
  const isSeated = !!p.jetski && hurtT < 0;

  // Set local coordinate frame: (0, 0) is at player feet center
  const anchorX = p.pos.x + p.width / 2;
  const anchorY = p.pos.y + p.height;
  // The body goes into an offscreen sprite (origin at his feet) so it gets a cartoon outline
  const world = ctx;
  const sprite = beginSprite(world);
  if (sprite) ctx = sprite;
  ctx.save();
  if (!sprite) ctx.translate(anchorX, anchorY);
  // (on the jet ski, shooting back: he stays sat facing forward, and just his head and gun arm turn round, below)
  const seatedBack = !!p.jetski && p.facing === -1 && !p.isCharging && !p.isUppercutting && !p.isDivekicking;
  ctx.scale(seatedBack ? 1 : p.facing, 1);
  // (headless: stood there a beat, then over backward, onto the ground)
  if (p.headless) { const k = Math.min(1, Math.max(0, (p.headless - 25) / 30)); ctx.translate(0, -k * k * 12); ctx.rotate(-k * k * 1.5); }
  const finishBody = () => {
    ctx.restore();
    ctx = world;
    // (sooted: black all over, fading back, just the whites of his eyes and a wisp of smoke off him)
    const soot = p.sootTimer && p.sootTimer > 0 ? Math.min(1, p.sootTimer / SOOT_FADE) : 0;
    if (sprite) endSprite(world, anchorX, anchorY, p.suit ? SUIT_TINT : soot > 0 ? `rgba(24, 20, 18, ${0.9 * soot})` : undefined);
    const eye = eyesAt(anchorX, anchorY);
    if (soot > 0 && !p.suit) {
      world.globalAlpha = soot;
      if (eye) {
        world.save(); world.translate(eye.x, eye.y); world.rotate(eye.angle);
        world.fillStyle = '#F8FAFC'; world.fillRect(-6, -1, 3, 2); world.fillRect(3, -1, 3, 2);
        world.restore();
      }
      for (let i = 0; i < 3; i++) {
        const t = ((state.frame + i * 23) % 70) / 70;
        world.fillStyle = `rgba(68, 64, 60, ${0.45 * (1 - t) * soot})`;
        world.beginPath(); world.arc(anchorX + Math.sin(i * 2.1 + state.frame * 0.05) * 10, anchorY - 70 - t * 40, 4 + t * 8, 0, Math.PI * 2); world.fill();
      }
      world.globalAlpha = 1;
    }
    if (p.suit && eye) {
      // The hood's visor, right over his eyes (whichever way he's facing, however he's posed: swimming, ducked, mid-move)
      world.save(); world.translate(eye.x, eye.y); world.rotate(eye.angle);
      world.fillStyle = 'rgba(31, 41, 55, 0.9)'; world.fillRect(-9, -4, 18, 8);
      world.fillStyle = 'rgba(163, 230, 53, 0.35)'; world.fillRect(-7, -3, 14, 2);
      world.restore();
    }
  };

  // Squash on landing, stretch on take-off and when moving fast vertically
  const isSpecial = p.isCharging || p.isUppercutting || !!p.isDivekicking;
  const airStretch = !p.isGrounded && !isSpecial && !p.swimming ? Math.min(1, Math.abs(p.vel.y) / PLAYER_TERMINAL_VELOCITY) * 0.1 : 0;
  const squash = p.squash || 0;
  ctx.scale(1 + squash * 0.25 - airStretch * 0.5, 1 - squash * 0.25 + airStretch);

  if (p.isSliding) {
    drawSlideTackle(ctx, animFrame, currentWeapon, isUnarmed);
    finishBody();
    ctx.restore();
    return;
  }
  // The special moves are full poses of their own (unless he's been knocked out of one)
  const movePose = hurtT >= 0 ? null
    // (on the jet ski they're the ski's moves: a wheelie, a leap out of the water, a nose-first dive)
    : p.jetski ? (isCharging ? drawJetskiWheelie : isUppercutting ? drawJetskiLeap : isDivekicking ? drawJetskiDive : null)
    // (booting somebody off his skis, boat or jet ski: a big standing front kick)
    // (dropped down through a ledge: arms up, legs together, straight down)
    : (p.ledgeDrop || 0) > 0 && !p.isGrounded && !p.swimming && !isCharging && !isUppercutting && !isDivekicking ? (c: CanvasRenderingContext2D, fr: number) => drawLedgeDrop(c, fr, 1 - (p.ledgeDrop || 0) / LEDGE_DROP_FRAMES)
    : (p.kickPose || 0) > 0 && !isDivekicking ? (c: CanvasRenderingContext2D, fr: number) => drawStandingKick(c, fr, 1 - (p.kickPose || 0) / KICK_POSE_FRAMES)
    : isCharging ? (p.swimming || p.swimDash ? (c: CanvasRenderingContext2D, fr: number) => { const d = p.swimDash; if (d && d.y) { c.translate(0, -p.height / 2); c.rotate(d.y * Math.PI / 2); c.translate(0, p.height / 2); } drawSwimCharge(c, fr); } : drawShoulderCharge) : isUppercutting ? drawUppercut : isDivekicking ? drawDivekick : null;
  if (movePose) {
    movePose(ctx, animFrame);
    finishBody();
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
  // 0 rising fast .. 1 falling fast
  const airFall = Math.max(0, Math.min(1, (p.vel.y + 6) / 12));

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
  } else if (isSeated) {
    // Sat up straight, riding the chop (leaning back into the landings)
    bodyRot = isAirborne ? -0.12 : -0.04;
    bodyY = Math.sin(animFrame * 0.18) * 1.2;
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
  } else if (isSwimming) {
    bodyRot = swimMoving ? 0.3 : 0.02;
    bodyY = Math.sin(animFrame * 0.12) * 2;
  } else if (isAirborne) {
    bodyRot = -0.03 + airFall * 0.06; // leaning back a touch on the way up, forward coming down
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
  if (surf) {
    // Surfing: back arm out behind him, low, for balance
    // (from the shoulder at the side of his chest, crouched as he is: clear of his face)
    ctx.fillStyle = skinShadow;
    ctx.beginPath(); ctx.arc(-11, -30, 7, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(-11, -30); ctx.rotate(Math.PI * 0.92);
    ctx.fillRect(0, -4, 26, 8); ctx.fillStyle = wristbandColor; ctx.fillRect(20, -4.5, 4, 9);
    ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.arc(28, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (isDivekicking) {
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
  } else if (isSeated) {
    // Reaching forward to the handlebars
    drawReachingArm(ctx, -6, -40, 6, -35, 21, -40, skinShadow);
    ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.arc(20, -40, 4.5, 0, Math.PI * 2); ctx.fill();
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
  } else if (isRelieving) {
    // Reaching down and forward to hold it (the hand itself is drawn with it, over the top)
    drawReachingArm(ctx, -6, -40, -1, -30, 7, -22, skinShadow);
  } else {
    // Idle / Walk pumping arm in opposition
    // Held a little back while he's in the air
    const armAngle = isSwimming ? (swimMoving ? (animFrame * 0.2) % (Math.PI * 2) : 0.9 + Math.sin(animFrame * 0.15) * 0.9)
      : isWalking ? -walkStride * 0.6
      : isAirborne ? 0.3 + airFall * 0.3
      : Math.sin(animFrame * 0.08) * 0.1;
    ctx.save();
    ctx.translate(-6, -40);
    ctx.rotate(armAngle);
    // Shoulder, bulging bicep and forearm
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath(); ctx.ellipse(-0.5, 6.5, 5.5, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-4.5, 7, 8.5, 7);
    ctx.fillStyle = backArmShade;
    ctx.beginPath(); ctx.ellipse(-3, 7, 2, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-4.5, 10, 2, 4);
    // Forearm & Spiked Wristband
    ctx.fillStyle = wristbandColor;
    ctx.fillRect(-6, 12, 11, 5);
    // Studs
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(-4, 13, 2, 3);
    ctx.fillRect(1, 13, 2, 3);
    // Fist, knuckles showing
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.arc(0, 21, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = backArmShade;
    ctx.fillRect(-3, 22, 6, 0.9);
    ctx.fillRect(-0.5, 22, 0.9, 3);
    if (gore > 0.4) smear(ctx, 1, 2, 4, 3, bloodDark);
    if (gore > 0.7) drip(ctx, 2, 3, 8);
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
  } else if (isSeated && p.bike) {
    // On the bike: feet on the pedals, going round (how far round's how far he's gone)
    drawPedalLegs(ctx, p.pos.x / 14);
  } else if (isSeated) {
    // Astride the seat: thighs out forward, shins down into the footwell
    drawJointedLeg(ctx, -4, -22, -1.3, 1.2, pantsShadow, false);
    drawJointedLeg(ctx, 5, -22, -1.4, 1.25, pantsColor, true);
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
    drawBoot(ctx, -20, -6, 14, 6, false);

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
    drawBoot(ctx, 6, -6, 15, 6, true);
    // Knee pad on the front thigh
    ctx.fillStyle = '#27272A';
    ctx.beginPath(); ctx.ellipse(17, -9.5, 3, 2.5, 0.3, 0, Math.PI * 2); ctx.fill();
  } else if (isSwimming) {
    // Kicking: a fast flutter kick when he's swimming somewhere, a slow scissor treading water
    const k = Math.sin(animFrame * (swimMoving ? 0.45 : 0.18));
    const reach = swimMoving ? 0.35 : 0.25;
    drawJointedLeg(ctx, -4, -22, 0.1 + k * reach, 0.3 + Math.max(0, k) * 0.3, pantsShadow, false);
    drawJointedLeg(ctx, 5, -22, 0.1 - k * reach, 0.3 + Math.max(0, -k) * 0.3, pantsColor, true);
  } else if (isAirborne) {
    // Jumping: lead knee comes up a bit on the way up, legs straighten for the landing coming down
    const fall = airFall;
    const lerp = (a: number, b: number) => a + (b - a) * fall;
    drawJointedLeg(ctx, -4, -22, lerp(0.12, 0.05), lerp(0.2, 0.05), pantsShadow, false);
    drawJointedLeg(ctx, 5, -22, lerp(-0.45, -0.1), lerp(0.6, 0.1), pantsColor, true);
  } else if (isHurt) {
    // Staggered backwards
    drawPantLeg(ctx, -14, -20, 10, 16, pantsShadow);
    drawBoot(ctx, -16, -4, 13, 6, false);
    drawPantLeg(ctx, 2, -22, 10, 18, pantsColor, true);
    drawBoot(ctx, 3, -4, 13, 6, true);
  } else if (isWalking) {
    // Smooth 2-legged walking cycle with knee bend & heel strike
    // Back leg
    ctx.fillStyle = pantsShadow;
    ctx.save();
    ctx.translate(-4, -20);
    ctx.rotate(-walkStride * 0.5);
    drawPantLeg(ctx, -5, 0, 9, 14, pantsShadow);
    drawBoot(ctx, -6, 12, 12, 7, false);
    ctx.restore();

    // Front leg
    ctx.fillStyle = pantsColor;
    ctx.save();
    ctx.translate(4, -20);
    ctx.rotate(walkStride * 0.5);
    drawPantLeg(ctx, -4, 0, 10, 14, pantsColor);
    drawBoot(ctx, -5, 12, 14, 7, true);
    ctx.restore();
  } else {
    // Idle grounded solid stance
    drawPantLeg(ctx, -10, -22, 10, 16, pantsShadow);
    drawBoot(ctx, -11, -6, 12, 7, false);
    drawPantLeg(ctx, 2, -22, 10, 16, pantsColor, true);
    // (the front boot tipping up on its heel when he's tapping his foot)
    ctx.save(); ctx.translate(2, 0); ctx.rotate(-footTap * 0.4); ctx.translate(-2, 0);
    drawBoot(ctx, 2, -6, 14, 7, true);
    // Tread grips
    ctx.fillStyle = '#09090B';
    ctx.fillRect(2, 0, 14, 2);
    ctx.restore();
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
  // Stitching along both edges, and a glint on the buckle
  ctx.fillStyle = '#D97706';
  for (let sx = -12; sx < 12; sx += 2.5) {
    if (sx > -6 && sx < 5) continue;
    ctx.fillRect(sx, beltY + 0.8, 1.3, 0.6);
    ctx.fillRect(sx, beltY + beltH - 1.3, 1.3, 0.6);
  }
  ctx.fillStyle = '#FEF9C3';
  ctx.fillRect(-4, beltY, 2.5, 1.2);
  ctx.restore();

  // ==========================================
  // LAYER 4: TORSO, CHISELED ABS & BULGING PECS
  // ==========================================
  ctx.save();
  const torsoTop = isDucking ? -36 : -50;
  const torsoHeight = isDucking ? 21 : 24;
  const pecY = isDucking ? -34 : -48;
  // Torso Base: lit from the front, shadowed round the back, lats flaring out
  const torsoShade = ctx.createLinearGradient(-14, 0, 14, 0);
  torsoShade.addColorStop(0, skinShadow);
  torsoShade.addColorStop(0.3, skinTone);
  torsoShade.addColorStop(1, skinTone);
  ctx.fillStyle = torsoShade;
  ctx.fillRect(-14, torsoTop, 28, torsoHeight);
  ctx.beginPath();
  ctx.moveTo(-14, torsoTop + 4); ctx.lineTo(-16, torsoTop + 9); ctx.lineTo(-14, torsoTop + 16);
  ctx.moveTo(14, torsoTop + 4); ctx.lineTo(16, torsoTop + 9); ctx.lineTo(14, torsoTop + 16);
  ctx.fill();
  // Serratus ridges and obliques down the front side
  ctx.fillStyle = skinShadow;
  for (let i = 0; i < 3; i++) ctx.fillRect(9.5, torsoTop + 11 + i * 3, 3, 0.9);
  ctx.beginPath();
  ctx.moveTo(10, torsoTop + torsoHeight - 1); ctx.lineTo(13.5, torsoTop + torsoHeight - 7); ctx.lineTo(13.5, torsoTop + torsoHeight - 1);
  ctx.fill();

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
  // Upper pec highlights, and the underside of each pec in shadow
  ctx.fillStyle = skinHighlight;
  ctx.fillRect(-11, pecY + 1.5, 8, 2);
  ctx.fillRect(3, pecY + 1.5, 8, 2);
  ctx.fillRect(5, pecY + 4, 4, 1.2);
  ctx.fillStyle = 'rgba(120, 70, 20, 0.35)';
  ctx.fillRect(-12, pecY + (isDucking ? 6 : 7.5), 11, 1.5);
  ctx.fillRect(2, pecY + (isDucking ? 6 : 7.5), 10, 1.5);
  // Sweat sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillRect(6, pecY + 2, 1.5, 1);
  ctx.fillRect(3, torsoTop + 15, 1, 1);

  // Trapezius muscles rising behind neck
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.moveTo(-12, torsoTop + 2);
  ctx.lineTo(-6, torsoTop - 6);
  ctx.lineTo(6, torsoTop - 6);
  ctx.lineTo(12, torsoTop + 2);
  ctx.closePath();
  ctx.fill();
  drawTorsoBlood(ctx, torsoTop, torsoHeight, pecY);
  ctx.restore();

  // Twisted round in the seat to shoot behind: the head and the gun arm face back, the rest stays facing forward
  if (seatedBack) ctx.scale(-1, 1);

  // ==========================================
  // LAYER 5: HEAD, GLOWING FACE & SCULPTED JAW
  // ==========================================
  ctx.save();
  const headX = isDucking ? 2 : (isCharging ? 6 : (isHurt ? -4 : (isUppercutting ? -1 : (isDivekicking ? 4 : 0))));
  const headY = isDucking ? -38 : (isUppercutting ? -60 : (isCharging ? -48 : (isDivekicking ? -48 : -54)));
  if (p.headless) {
    // Where his head was: the neck, a ragged red stump, a bit of spine, and it's still pumping
    ctx.fillStyle = skinTone; ctx.fillRect(headX - 6, headY + 2, 12, 8);
    ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.ellipse(headX, headY + 3, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(headX - 1.5, headY, 3, 3);
    const spurt = p.headless < 70 ? 1 - p.headless / 70 : 0;
    if (spurt > 0) {
      ctx.fillStyle = '#DC2626';
      for (let i = 0; i < 5; i++) { const t = ((animFrame * 0.2 + i * 0.2 + p.headless * 0.05) % 1); ctx.beginPath(); ctx.arc(headX + Math.sin(i * 2.3) * 4 * t, headY - t * 24 * spurt, 2.5 - t * 1.5, 0, Math.PI * 2); ctx.fill(); }
    }
  } else {

  // Granite Square Jaw & Face base
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.roundRect(headX - 10, headY - 12, 20, 20, [4, 4, 3, 3]);
  ctx.fill();

  // Back of the head in shadow, ear, cheekbone and a square chin
  ctx.fillStyle = 'rgba(150, 90, 35, 0.35)';
  ctx.fillRect(headX - 10, headY - 11, 3.5, 18);
  ctx.fillStyle = skinShadow;
  ctx.beginPath(); ctx.roundRect(headX - 12, headY - 7, 3.5, 7, 1.5); ctx.fill();
  ctx.fillStyle = '#A0662E';
  ctx.fillRect(headX - 11.2, headY - 5, 1.2, 3);
  ctx.fillStyle = skinHighlight;
  ctx.fillRect(headX + 4, headY - 1, 4.5, 1.2);
  ctx.fillRect(headX + 7.5, headY - 10, 1.2, 5);

  // 5 O'clock Stubble Shadow along jawline, speckled
  ctx.fillStyle = 'rgba(120, 53, 15, 0.25)';
  ctx.fillRect(headX - 9, headY + 1, 18, 7);
  ctx.fillStyle = stubbleColor;
  for (let i = 0; i < 14; i++) ctx.fillRect(headX - 8.5 + (i * 3.7) % 17, headY + 2 + (i * 2.3) % 5.5, 0.8, 0.8);
  // Jaw underline and chin cleft
  ctx.fillStyle = '#A0662E';
  ctx.fillRect(headX - 8, headY + 7.2, 16, 0.8);
  ctx.fillRect(headX + 0.8, headY + 5.5, 0.7, 2);
  // Nose
  ctx.fillStyle = skinShadow;
  ctx.fillRect(headX + 1.2, headY - 3, 1.1, 4);
  ctx.fillRect(headX + 0.2, headY + 0.8, 3.5, 1);

  // Military Buzzcut / Flat-Top Hair
  ctx.fillStyle = '#18181B';
  // Flat top
  ctx.fillRect(headX - 10, headY - 16, 20, 5);
  // Temple fade sides
  ctx.fillRect(headX - 11, headY - 14, 2, 7);
  ctx.fillRect(headX + 9, headY - 14, 2, 7);
  // Bristle texture and shine on the flat-top
  ctx.fillStyle = '#3F3F46';
  ctx.fillRect(headX - 8, headY - 15.5, 13, 1);
  ctx.fillStyle = '#52525B';
  for (let i = 0; i < 6; i++) ctx.fillRect(headX - 8 + i * 3, headY - 16.8, 1, 1.3);

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
  if (isAngry) {
    // Crushed down into a deep scowl
    ctx.beginPath();
    ctx.moveTo(headX - 9, headY - 10); ctx.lineTo(headX - 0.5, headY - 4.5); ctx.lineTo(headX - 0.5, headY - 2.5); ctx.lineTo(headX - 9, headY - 7.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + 9, headY - 10); ctx.lineTo(headX + 0.5, headY - 4.5); ctx.lineTo(headX + 0.5, headY - 2.5); ctx.lineTo(headX + 9, headY - 7.5);
    ctx.fill();
    // Furrow lines between the brows
    ctx.fillStyle = '#A0662E';
    ctx.fillRect(headX - 1.2, headY - 9, 0.8, 3.5);
    ctx.fillRect(headX + 0.6, headY - 9, 0.8, 3.5);
    ctx.fillStyle = '#09090B';
  } else if (isHurt) {
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
  markEyes(ctx, (lEyeX + rEyeX) / 2, eyeY);

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
  } else if (isAngry) {
    // Locked on: narrowed to slits under the scowl, pupils fixed dead ahead
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(lEyeX - 2.5, eyeY - 0.5, 5, 2.2);
    ctx.fillRect(rEyeX - 2.5, eyeY - 0.5, 5, 2.2);
    ctx.fillStyle = '#09090B';
    ctx.fillRect(lEyeX + 0.3, eyeY - 0.3, 1.6, 1.8);
    ctx.fillRect(rEyeX + 0.3, eyeY - 0.3, 1.6, 1.8);
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
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(lEyeX + 1.4, eyeY - 0.8, 0.8, 0.8);
      ctx.fillRect(rEyeX + 1.4, eyeY - 0.8, 0.8, 0.8);
      ctx.fillStyle = skinShadow;
      ctx.fillRect(lEyeX - 2.5, eyeY + 1.5, 5, 0.8);
      ctx.fillRect(rEyeX - 2.5, eyeY + 1.5, 5, 0.8);
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
  } else if (isAngry) {
    // Teeth bared in a wide, clenched grimace, gums showing
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath(); ctx.roundRect(headX - 7, mouthY - 1, 14, 5.5, 1.5); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX - 6, mouthY - 0.2, 12, 1.8);
    ctx.fillRect(headX - 6, mouthY + 1.9, 12, 1.8);
    ctx.fillStyle = '#18181B';
    for (let k = -4; k <= 4; k += 2.6) ctx.fillRect(headX + k, mouthY - 0.2, 0.6, 3.9);
    ctx.fillRect(headX - 6, mouthY + 1.6, 12, 0.4);
  } else if (p.shootHeldLastFrame && !isUnarmed) {
    // Firing: lip curled back off bared teeth
    ctx.fillStyle = '#450A0A';
    ctx.beginPath();
    ctx.moveTo(headX - 6, mouthY); ctx.lineTo(headX + 6, mouthY - 1.5); ctx.lineTo(headX + 6, mouthY + 4); ctx.lineTo(headX - 6, mouthY + 3.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX - 5, mouthY + 0.3, 10.5, 1.4);
    ctx.fillRect(headX - 5, mouthY + 2.2, 10.5, 1.2);
    ctx.fillStyle = '#18181B';
    ctx.fillRect(headX - 2, mouthY, 0.7, 3.5);
    ctx.fillRect(headX + 1.5, mouthY, 0.7, 3.5);
  } else if (isAirborne && p.vel.y < -4) {
    // "HUP!" on the way up
    ctx.fillStyle = '#450A0A';
    ctx.beginPath(); ctx.ellipse(headX + 0.5, mouthY + 1.5, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX - 1.8, mouthY - 0.6, 4.5, 1);
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
  if (isAngry) {
    // A second vein throbbing on his temple, and a set, clenched jaw
    ctx.strokeStyle = skinVein;
    ctx.lineWidth = animFrame % 10 < 5 ? 1.6 : 1.1;
    ctx.beginPath();
    ctx.moveTo(headX + 3, headY - 11); ctx.lineTo(headX + 6, headY - 9); ctx.lineTo(headX + 5, headY - 6.5);
    ctx.stroke();
    ctx.fillStyle = '#A0662E';
    ctx.fillRect(headX - 9.5, headY + 2, 1, 4);
    ctx.fillRect(headX + 8.5, headY + 2, 1, 4);
  }
  drawHeadBlood(ctx, headX, headY, animFrame);
  if (!isRelieving) drawBeatenUp(ctx, headX, headY, animFrame);
  }
  ctx.restore();

  // ==========================================
  // LAYER 6: LEAD ARM (Main Arm & Weapon)
  // ==========================================
  ctx.save();
  if (surf) {
    // Surfing: lead arm out in front, up a bit, throwing a shaka (thumb and little finger out)
    // (from the shoulder at the side of his chest, crouched as he is: the arm goes out and up past his face, not over it)
    ctx.fillStyle = skinTone;
    ctx.beginPath(); ctx.arc(12, -30, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(12, -30); ctx.rotate(-0.45);
    ctx.fillRect(0, -4.5, 28, 9); ctx.fillStyle = wristbandColor; ctx.fillRect(22, -5, 4, 10);
    ctx.fillStyle = skinTone; ctx.beginPath(); ctx.arc(31, 0, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(30, -11, 3, 7); ctx.fillRect(34, 3, 6, 3); // thumb up, little finger out
    ctx.restore();
  } else if (isDivekicking) {
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
  } else if (isRelieving) {
    drawReachingArm(ctx, 8, -42, 13, -32, 12, -21, skinTone);
  } else {
    // Walking / Standing / Ducking Aiming Pose
    const armPump = isWalking ? walkStride * 8 : 0;
    const armBaseX = isDucking ? 10 : 8;
    const armBaseY = isDucking ? -26 : -42;
    // Just threw a boulder: the arm follows through from the shoulder (up and over for a lob, a low bowl otherwise)
    const throwing = (p.throwTimer || 0) > 0;
    if (throwing) {
      const t = 1 - p.throwTimer! / BOULDER_THROW_FRAMES;
      const ease = 1 - Math.pow(1 - t, 3);
      const [from, to] = p.throwLob ? [-2.3, -0.8] : [1.0, -0.35];
      ctx.translate(armBaseX, armBaseY); ctx.rotate(from + (to - from) * ease); ctx.translate(-armBaseX, -armBaseY);
    }

    // Shoulder Delt
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(armBaseX, armBaseY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skinHighlight;
    ctx.beginPath();
    ctx.arc(armBaseX + 2, armBaseY - 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Upper arm / Forearm extending forward to hold weapon, bicep bulging underneath
    ctx.fillStyle = skinTone;
    ctx.fillRect(armBaseX - 2, armBaseY + 2, 12 + armPump * 0.3, 8);
    ctx.beginPath(); ctx.ellipse(armBaseX + 2.5, armBaseY + 7.5, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skinShadow;
    ctx.fillRect(armBaseX - 1, armBaseY + 10.2, 8, 1.2);
    ctx.beginPath(); ctx.arc(armBaseX, armBaseY, 8, 0.6, 1.6); ctx.lineTo(armBaseX, armBaseY); ctx.fill();
    ctx.fillStyle = skinTone;
    ctx.beginPath(); ctx.arc(armBaseX, armBaseY, 6.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skinHighlight;
    ctx.beginPath(); ctx.arc(armBaseX + 2, armBaseY - 2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(armBaseX + 3, armBaseY + 3, 4, 1);
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
    ctx.fillStyle = skinShadow;
    for (let k = 0; k < 3; k++) ctx.fillRect(armBaseX + 13 + armPump * 0.3 + k * 2, armBaseY + 8.5, 0.8, 2);
    drawLeadArmBlood(ctx, armBaseX, armBaseY, armPump * 0.3);

    // Render Equipped Weapon in Meathead's lead hand!
    const wpnX = armBaseX + 10 + armPump * 0.3;
    const wpnY = armBaseY + 2;

    // (his hand's empty for a moment after a throw)
    if (!isUnarmed && !throwing) drawHeldWeapon(ctx, currentWeapon, wpnX, wpnY, p.flameAngle || 0, animFrame);
  }
  ctx.restore();

  // Back out of his local frame and stamp the outlined sprite into the world
  finishBody();

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
 * The equipped weapon in his lead hand, drawn at (wpnX, wpnY) in his local frame
 * (the grip; the barrel points along +x). Each one has a little life to it: a
 * glint, sloshing liquid, a pilot light, sparks. game/combat/muzzle.ts mirrors where
 * each tip ends up, so the tips stay where they are.
 */
const drawHeldWeapon = (ctx: CanvasRenderingContext2D, weapon: WeaponType, wpnX: number, wpnY: number, flameAngle: number, frame: number) => {
  ctx.save();
  ctx.translate(wpnX, wpnY);
  const glint = (x0: number, len: number, y: number, h: number, period = 150) => {
    // A glint of light sweeping along the metal every couple of seconds
    const t = frame % period;
    if (t > 14) return;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(x0 + (t / 14) * len, y, 2, h);
  };
  switch (weapon) {
    case 'GUN': {
      // Handgun: slide over the frame, grip in his fist, muzzle out front
      ctx.fillStyle = '#27272A'; ctx.fillRect(4, 0, 18, 5);            // slide
      ctx.fillStyle = '#6B7280'; ctx.fillRect(4, 0, 18, 1);            // top edge catching the light
      ctx.fillStyle = '#18181B';
      for (const sx of [6, 8, 10]) ctx.fillRect(sx, 2, 1, 2);          // serrations
      ctx.fillRect(20, -1, 2, 1); ctx.fillRect(5, -1, 2, 1);           // front and rear sights
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(5, 5, 12, 2);            // frame
      ctx.fillStyle = '#18181B'; ctx.fillRect(9, 7, 4, 2);             // trigger guard
      ctx.fillStyle = '#52525B'; ctx.fillRect(22, 1, 3, 3);            // muzzle
      ctx.fillStyle = '#B45309'; ctx.fillRect(4, 5, 3, 3);             // wood grip panel peeking out of his fist
      glint(4, 16, 1, 3);
      break;
    }
    case 'BOULDER': {
      // A craggy chunk of rock, cracked and mossy, bobbing a touch in his grip
      const bob = Math.sin(frame * 0.08) * 0.8;
      ctx.translate(12, -4 + bob);
      ctx.fillStyle = '#854D0E';
      ctx.beginPath();
      ctx.moveTo(-12, -2); ctx.lineTo(-8, -10); ctx.lineTo(1, -13); ctx.lineTo(9, -9); ctx.lineTo(13, -1);
      ctx.lineTo(10, 8); ctx.lineTo(2, 12); ctx.lineTo(-7, 10); ctx.lineTo(-12, 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#A16207';                                       // lit face
      ctx.beginPath(); ctx.moveTo(-8, -9); ctx.lineTo(1, -12); ctx.lineTo(8, -8); ctx.lineTo(2, -4); ctx.lineTo(-6, -4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#65A30D';                                       // moss
      ctx.beginPath(); ctx.ellipse(-4, -10, 4, 2, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#451A03'; ctx.lineWidth = 1.5;                // cracks
      ctx.beginPath(); ctx.moveTo(-3, -3); ctx.lineTo(1, 2); ctx.lineTo(-1, 7); ctx.moveTo(1, 2); ctx.lineTo(7, 3); ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -2); ctx.lineTo(-8, -10); ctx.lineTo(1, -13); ctx.lineTo(9, -9); ctx.lineTo(13, -1);
      ctx.lineTo(10, 8); ctx.lineTo(2, 12); ctx.lineTo(-7, 10); ctx.lineTo(-12, 5); ctx.closePath(); ctx.stroke();
      break;
    }
    case 'SHOTGUN': {
      // Cryo shotgun: blue receiver with glowing coolant bands, a steel barrel breathing frost
      ctx.fillStyle = '#0C4A6E'; ctx.fillRect(-6, 2, 7, 6);            // stock
      ctx.fillStyle = '#0284C7'; ctx.fillRect(0, 0, 14, 8);            // receiver
      ctx.fillStyle = '#94A3B8'; ctx.fillRect(12, 1, 10, 5);           // barrel
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(12, 1, 10, 1);
      ctx.fillStyle = '#075985'; ctx.fillRect(5, 8, 9, 3);             // pump
      const pulse = 0.55 + 0.45 * Math.sin(frame * 0.15);
      ctx.fillStyle = `rgba(125, 211, 252, ${pulse})`;
      for (const bx of [3, 7, 11]) ctx.fillRect(bx, 1, 2, 6);          // coolant bands
      ctx.fillStyle = '#E0F2FE'; ctx.fillRect(21, 2, 2, 3);            // frosted muzzle
      // Frost wisps curling off the muzzle
      for (let i = 0; i < 2; i++) {
        const t = ((frame + i * 20) % 40) / 40;
        ctx.fillStyle = `rgba(224, 242, 254, ${0.6 * (1 - t)})`;
        ctx.beginPath(); ctx.arc(23 + t * 6, 2 - t * 8, 1.5 + t * 2.5, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'NEEDLES': {
      // Syringe launcher: a clear barrel of sloshing pink dope, plunger at the back, needle out front
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-6, 2, 6, 3); ctx.fillRect(-8, 0, 2, 7);  // plunger and thumb plate
      ctx.fillStyle = 'rgba(226, 232, 240, 0.9)'; ctx.fillRect(0, 0, 20, 7);             // barrel
      const slosh = Math.sin(frame * 0.12) * 1.5;
      ctx.fillStyle = COLORS.PROJECTILE_DART;
      ctx.beginPath(); ctx.moveTo(1, 3 + slosh * 0.5); ctx.lineTo(19, 3 - slosh * 0.5); ctx.lineTo(19, 6); ctx.lineTo(1, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#64748B'; for (const mx of [5, 9, 13]) ctx.fillRect(mx, 0, 1, 2); // measure marks
      ctx.fillStyle = '#EF4444'; ctx.fillRect(18, 1, 4, 5);                               // hub
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(22, 3, 4, 1);                               // needle
      if (frame % 50 < 6) { ctx.fillStyle = '#F0ABFC'; ctx.beginPath(); ctx.arc(26, 4 + (frame % 50) * 0.6, 1.2, 0, Math.PI * 2); ctx.fill(); } // a bead of it dripping
      break;
    }
    case 'FLAMETHROWER': {
      // Industrial flamethrower on a swivel: fuel canister, gauge, and a pilot light that never goes out
      ctx.save();
      ctx.translate(4, 4);
      ctx.rotate(flameAngle);
      ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(-2, 7, 5, 0, Math.PI * 2); ctx.fill();   // fuel canister
      ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.arc(-2, 7, 2, 0, Math.PI * 2); ctx.fill();   // gauge
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(0, -4, 24, 9);
      ctx.fillStyle = '#52525B'; ctx.fillRect(0, -4, 24, 2);
      ctx.fillStyle = '#27272A'; for (const hx of [6, 10, 14]) ctx.fillRect(hx, -4, 2, 9);          // heat fins
      ctx.fillStyle = '#EA580C'; ctx.fillRect(22, -2, 5, 5);                                         // nozzle
      // Pilot light: a little blue-and-orange flame licking at the nozzle
      const flick = 2 + Math.abs(Math.sin(frame * 0.6)) * 3;
      ctx.fillStyle = '#60A5FA'; ctx.beginPath(); ctx.ellipse(28, 0.5, 1.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FB923C'; ctx.beginPath(); ctx.moveTo(27.5, -0.5); ctx.lineTo(29 + flick, -1 - flick * 0.4); ctx.lineTo(28.5, 1.5); ctx.closePath(); ctx.fill();
      ctx.restore();
      break;
    }
    case 'SLUDGE': {
      // Toxic sludge launcher: a glass canister of bubbling green on top, a dripping nozzle
      ctx.fillStyle = '#14532D'; ctx.fillRect(0, 0, 22, 10);
      ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, 22, 2);
      ctx.fillStyle = 'rgba(187, 247, 208, 0.5)'; ctx.fillRect(3, -6, 11, 7);                       // canister glass
      ctx.fillStyle = '#22C55E'; ctx.fillRect(4, -3 + Math.sin(frame * 0.1), 9, 4);                  // sludge
      for (let i = 0; i < 2; i++) { const t = ((frame + i * 17) % 34) / 34; ctx.fillStyle = '#BBF7D0'; ctx.beginPath(); ctx.arc(6 + i * 4, 0 - t * 4, 1 + t * 0.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#052E16'; ctx.lineWidth = 1; ctx.strokeRect(3, -6, 11, 7);
      ctx.fillStyle = '#4ADE80'; ctx.fillRect(16, 2, 6, 6);                                          // nozzle
      const drip = (frame % 70) / 70;
      if (drip < 0.5) { ctx.fillStyle = '#86EFAC'; ctx.beginPath(); ctx.arc(20, 9 + drip * 12, 1.5, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'TSUNAMI': {
      // Hydro cannon: a gauge window with water sloshing in it, a chrome nozzle ring, drips
      ctx.fillStyle = '#1D4ED8'; ctx.fillRect(0, 0, 24, 10);
      ctx.fillStyle = '#1E40AF'; ctx.fillRect(0, 8, 24, 2);
      ctx.fillStyle = '#0F172A'; ctx.fillRect(3, 2, 11, 5);                                          // gauge window
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath(); ctx.moveTo(3, 7);
      for (let x = 0; x <= 11; x++) ctx.lineTo(3 + x, 4 + Math.sin(frame * 0.2 + x * 0.8) * 1);
      ctx.lineTo(14, 7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#E2E8F0'; ctx.fillRect(18, 1, 3, 8);                                          // nozzle ring
      ctx.fillStyle = '#93C5FD'; ctx.fillRect(21, 2, 3, 6);
      const drip = (frame % 60) / 60;
      if (drip < 0.4) { ctx.fillStyle = '#BFDBFE'; ctx.beginPath(); ctx.arc(23, 10 + drip * 14, 1.3, 0, Math.PI * 2); ctx.fill(); }
      glint(0, 16, 1, 2, 170);
      break;
    }
    case 'TASER': {
      // High voltage stun gun: hazard-striped body, two prongs with a spark jumping between them
      ctx.fillStyle = '#18181B'; ctx.fillRect(0, 0, 20, 8);
      ctx.fillStyle = '#FACC15';
      for (let sx = 2; sx < 14; sx += 5) { ctx.beginPath(); ctx.moveTo(sx, 8); ctx.lineTo(sx + 3, 8); ctx.lineTo(sx + 5, 5); ctx.lineTo(sx + 2, 5); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = COLORS.TASER_BOLT; ctx.fillRect(18, 1, 3, 6);                                  // emitter
      ctx.fillStyle = '#D1D5DB'; ctx.fillRect(21, 1, 4, 1.5); ctx.fillRect(21, 5.5, 4, 1.5);          // prongs
      if (frame % 9 < 5) {
        ctx.strokeStyle = '#E0FFFF'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(24, 2); ctx.lineTo(25 + (frame % 2), 3.5); ctx.lineTo(23.5, 4.5); ctx.lineTo(24.5, 6); ctx.stroke();
      }
      ctx.fillStyle = frame % 30 < 15 ? '#22C55E' : '#14532D'; ctx.fillRect(4, 2, 2, 2);              // charge light
      break;
    }
    case 'LMG': {
      // A light machine gun: a long ventilated barrel, a bipod folded under it, a box of belted rounds hanging off it
      ctx.fillStyle = '#27272A'; ctx.fillRect(-2, -1, 24, 7);                                         // receiver
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(22, 0, 14, 4);                                          // barrel shroud
      ctx.fillStyle = '#18181B'; for (const vx of [24, 28, 32]) ctx.fillRect(vx, 1, 2, 2);             // vents
      ctx.fillStyle = '#52525B'; ctx.fillRect(36, 1, 3, 2);                                           // muzzle
      ctx.fillStyle = '#18181B'; ctx.fillRect(-8, 0, 7, 5); ctx.fillRect(4, 6, 4, 5);                  // stock, grip
      ctx.fillStyle = '#3F3F2E'; ctx.fillRect(8, 6, 10, 9);                                           // the ammo box
      ctx.fillStyle = '#CA8A04'; for (let k = 0; k < 4; k++) ctx.fillRect(17 + k * 2, 5 + k, 2, 3);    // the belt
      ctx.fillStyle = '#6B7280'; ctx.fillRect(-2, -1, 24, 1);
      glint(-2, 36, 0, 2, 120);
      break;
    }
    case 'OIL_ROCKET': {
      // Military launcher: striped tube, a sight on top, the red warhead loaded and ready
      ctx.fillStyle = '#3F3F2E'; ctx.fillRect(-4, -2, 28, 10);
      ctx.fillStyle = '#18181B'; ctx.fillRect(-4, -2, 28, 2); ctx.fillRect(-6, -3, 3, 12);           // top edge, rear flare
      ctx.fillStyle = '#FACC15'; ctx.fillRect(2, -2, 3, 10); ctx.fillRect(14, -2, 3, 10);            // hazard bands
      ctx.fillStyle = '#27272A'; ctx.fillRect(8, -7, 6, 4); ctx.fillStyle = '#F87171'; ctx.fillRect(12, -6, 2, 2); // sight, red dot
      ctx.fillStyle = '#18181B'; ctx.fillRect(6, 8, 4, 4);                                            // grip
      ctx.fillStyle = '#DC2626';
      ctx.beginPath(); ctx.moveTo(24, -2); ctx.lineTo(32, 3); ctx.lineTo(24, 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FCA5A5'; ctx.beginPath(); ctx.moveTo(24, -1); ctx.lineTo(29, 2); ctx.lineTo(24, 2); ctx.closePath(); ctx.fill();
      glint(-4, 26, -1, 2, 190);
      break;
    }
  }
  ctx.restore();
};

/**
 * Slide tackle (crouch + charge): leaning way back, lead boot skimming the
 * floor steel-toe first, back leg tucked under, one palm planted behind.
 * Drawn in the player's local frame: (0,0) is between the feet, +x is forward.
 */
const drawSlideTackle = (ctx: CanvasRenderingContext2D, frame: number, weapon: WeaponType, unarmed: boolean) => {
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
  drawTorsoBlood(ctx, -26, 23, -25);
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
  drawHeadBlood(ctx, hx, hy, frame);
  drawBeatenUp(ctx, hx, hy, frame);

  // Lead arm thrust forward, gun leading the slide
  ctx.fillStyle = skinTone;
  ctx.beginPath(); ctx.arc(-18, -34, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-18, -38, 18, 8);
  ctx.fillStyle = wristbandColor;
  ctx.fillRect(-2, -39, 5, 10);
  ctx.fillStyle = skinTone;
  ctx.beginPath(); ctx.arc(6, -34, 5.5, 0, Math.PI * 2); ctx.fill();
  // (his actual weapon, where game/combat/muzzle.ts says shots come out mid-slide)
  if (!unarmed) drawHeldWeapon(ctx, weapon, SLIDE_HOLD.x, SLIDE_HOLD.y, 0, frame);

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

/** An arm bent at the elbow reaching from the shoulder to a point, ending in a wristband (no fist). */
const drawReachingArm = (ctx: CanvasRenderingContext2D, sx: number, sy: number, ex: number, ey: number, hx: number, hy: number, skin: string) => {
  ctx.save();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(sx, sy, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = skin;
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx - 3, hy - 2); ctx.stroke();
  ctx.strokeStyle = wristbandColor;
  ctx.lineWidth = 8;
  ctx.lineCap = 'butt';
  const dx = hx - ex, dy = hy - ey, len = Math.hypot(dx, dy) || 1;
  ctx.beginPath();
  ctx.moveTo(hx - 3 - (dx / len) * 6, hy - 2 - (dy / len) * 6);
  ctx.lineTo(hx - 3 - (dx / len) * 1, hy - 2 - (dy / len) * 1);
  ctx.stroke();
  ctx.restore();
};

/** A trouser leg: shaded down the back, a crease at the knee and (on the near leg) a cargo pocket. */
const drawPantLeg = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, pocket = false) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  // Blood soaking into the fabric as he takes a beating
  const gore = getGore();
  if (gore > 0.5) {
    ctx.fillStyle = 'rgba(60, 5, 10, 0.55)';
    ctx.beginPath(); ctx.ellipse(x + w * 0.6, y + h * 0.25, w * 0.3, h * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  if (gore > 0.8) {
    ctx.fillStyle = 'rgba(60, 5, 10, 0.5)';
    ctx.beginPath(); ctx.ellipse(x + w * 0.35, y + h * 0.7, w * 0.35, h * 0.22, -0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(x, y, w * 0.3, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(x + w - 2, y + 1, 1.2, h - 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x + 1, y + h * 0.58, w - 2, 0.9);
  if (pocket) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + w * 0.35, y + 2, w * 0.5, h * 0.35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x + w * 0.35, y + 2, w * 0.5, 0.8);
  }
};

/** A combat boot: laces, a thick sole and (on the near foot) a shiny steel toe. */
const drawBoot = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, steelToe: boolean) => {
  ctx.fillStyle = bootColor;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, [2, 3, 1, 1]); ctx.fill();
  ctx.fillStyle = '#3F3F46';
  ctx.fillRect(x + 1, y + 0.8, w * 0.45, 0.9);
  ctx.fillStyle = '#71717A';
  for (let i = 0; i < 2; i++) ctx.fillRect(x + 2 + i * 3, y + 2, 1.6, 0.8);
  ctx.fillStyle = '#09090B';
  ctx.fillRect(x, y + h - 1.6, w, 1.6);
  if (steelToe) {
    ctx.fillStyle = bootToe;
    ctx.beginPath(); ctx.roundRect(x + w - 6, y + 1, 6, h - 2.6, [1, 2.5, 0, 0]); ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(x + w - 4.5, y + 1.6, 2, 1.2);
  }
};

/** A leg bent at the knee: thigh from the hip, then the shin (angles from straight down; negative = forward). */
const drawJointedLeg = (ctx: CanvasRenderingContext2D, hipX: number, hipY: number, thighAngle: number, kneeBend: number, color: string, near: boolean) => {
  const w = near ? 10 : 9;
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(thighAngle);
  drawPantLeg(ctx, -w / 2, 0, w, 12, color, near);
  ctx.translate(0, 11);
  ctx.rotate(kneeBend);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, Math.PI * 2); ctx.fill();
  drawPantLeg(ctx, -w / 2 + 0.5, 0, w - 1, 10, color);
  drawBoot(ctx, -w / 2, 9, w + 4, 7, near);
  ctx.restore();
};
