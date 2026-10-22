import { Player, WeaponType } from '../../../types';
import { drawFilthShield } from './filthShield';
import { drawLadderBackArm, drawLadderLegs, drawLadderClimb, drawOverheadPull } from './ladder';
import { drawRemains } from './remains';
import { drawFreefall } from './freefall';
import { drawExtinguisherPose } from './extinguisher';
import { drawThronePose } from './throne';
import { drawCopterSeatPose } from './copterPose';
import { drawTragonPose } from './tragonPose';
import { drawBroomRidePose } from './broomPose';
import { drawCatPlayer, setCatBody } from './catBody';
import { BOULDER_THROW_FRAMES, GUN_COOLDOWN, COLORS, INITIAL_PLAYER_HEALTH, PLAYER_TERMINAL_VELOCITY, PLAYER_MOVE_SPEED, PLAYER_INVINCIBILITY_FRAMES, SPECIAL_HURT_FRAMES } from '../../../constants';
import { peeProgress } from '../../scenes/victoryPee';
import { SLIDE_HOLD, vineGrip, vineLean, VINE_SHOULDER } from '../../combat/muzzle';
import { pitchLean, drawPitchLegs, drawPitchArm, drawPitchGloveArm, kegLean, drawKegLegs, drawKegArm, drawKegGloveArm } from './pitch';
import { PITCH_FRAMES } from '../../combat/finaleBuffs';
import { sprintLeg, drawShoulderCharge, drawSwimCharge, drawUppercut, drawDivekick, drawJetskiWheelie, drawJetskiLeap, drawJetskiDive, drawStandingKick, drawPedalLegs, drawLedgeDrop, drawGunslinger, drawAxeSwing } from './moves';
import { KICK_POSE_FRAMES, LEDGE_DROP_FRAMES, FINALE_STAGE } from '../../../constants';
import { GameState } from '../../core/state';
import { GroundRun, runAt, treadYAt, stanceDrop, STANCE } from '../../core/terrain';
import { beginSprite, endSprite, markEyes, eyesAt } from './spriteOutline';
import { drawPlayerShadow } from './shadow';
import { drawDeathBrows, drawDeathEyes, drawDeathMouth } from './deathFace';
import { rayGun } from '../../combat/rayGun';
import { customWeapon } from '../../combat/customWeapons';
import { buffs } from '../../core/buffs';
import { setGore, getGore, smear, drip, drawHeadBlood, drawLeadArmBlood, drawBeatenUp, bloodDark } from './gore';
import { skinTone, skinShadow, skinHighlight, skinVein, pantsColor, pantsShadow, beltColor, beltBuckle, wristbandColor, backArmShade, stubbleColor, drawTorso, drawBelt, drawArm, drawPantLeg, drawBoot, drawJointedLeg, drawLeg, drawArmTo, drawHead, drawGlasses, setTalking, drawTalkingMouth, setLegSinge, setNude, snesShat } from './body';

export interface PlayerDrawOptions {
  currentWeapon: WeaponType;
  /** The filth shield aura is only shown during active play. */
  showFilthShield: boolean;
  invincibilityEnabled: boolean;
  /** Standing about, bored: the front foot's toe tapping (0 down, 1 up). */
  footTap?: number;
  /** Surfing (on Barry's man, down out of the sky): knees bent low, arms out wide for balance, throwing a shaka, no gun. */
  surf?: boolean;
  /** Throw his shadow as the stage's light falls (his silhouette on the ground and up the walls): the world's own draw of him. */
  castShadow?: boolean;
  /** Something in his lead hand in place of the gun (a stage's cutscene: the ninja's sword), drawn in his hand's frame at the fist (x, y), the way the arm's turned. */
  hold?: (ctx: CanvasRenderingContext2D, x: number, y: number) => void;
}

/** How long the handgun's kick takes to settle (frames after a shot). */
const GUN_KICK_FRAMES = 6;

/** Black with soot (a room blown up round him): how long it takes to wear off at the end (frames). */
export const SOOT_FRAMES = 420;
const SOOT_FADE = 120;
/** A dye's last frames: fading back to himself. */
const DYE_FADE = 180;
/** The color over all of him, if any (whoever draws him, wherever: his own sprite, a grab's poses): a suit, soot, a
 *  vat's dye fading out over its last few seconds. */
export const playerTint = (p: Player): string | undefined => {
  if (p.spaceSuit && p.gut?.stage !== 3) return SPACE_SUIT_TINT;
  if (p.suit) return SUIT_TINT;
  const soot = p.sootTimer && p.sootTimer > 0 ? Math.min(1, p.sootTimer / SOOT_FADE) : 0;
  if (soot > 0) return `rgba(24, 20, 18, ${0.9 * soot})`;
  const dye = p.dyeTimer && p.dyeTimer > 0 && p.dyeColor ? Math.min(1, p.dyeTimer / DYE_FADE) : 0;
  if (dye <= 0) return undefined;
  const h = p.dyeColor!.replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(ch => ch + ch).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${(0.7 * dye).toFixed(3)})`;
};
/** In a hazmat suit (Tommy's sewer): yellow over all of him, a hood's dark visor over his face. */
const SUIT_TINT = 'rgba(250, 204, 21, 0.78)';
/** In a space suit (Meathead 2's Space Needle 2): white over all of him but his face, the fishbowl helmet over that. */
const SPACE_SUIT_TINT = 'rgba(241, 245, 249, 0.8)';

/** Draws Meathead: effects auras, then body layers back-to-front, then the held weapon. */
/** Held on the knife (Player.stabbed, its stabs): how far he's doubled over (his lean about his feet) and sagged down;
 *  he jerks over at each stab, and sags back. */
export const stabLean = (st: { t: number; at: readonly number[] }) => {
  let k = 0;
  for (const a of st.at) { const u = st.t - a; if (u >= 0 && u < 16) k = Math.max(k, u < 3 ? u / 3 : Math.pow(1 - (u - 3) / 13, 2)); }
  return { rot: 0.14 + 0.3 * k, y: 2 + 3 * k - (st.t < 8 ? st.t * 0.4 : 3) };
};
/** Held on the knife: where the hole's in him (his local frame: the way he faces, from his feet). */
export const STAB_WOUND = { x: 13, y: -34 };

export const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player, state: GameState, { currentWeapon, showFilthShield, invincibilityEnabled, footTap = 0, surf = false, castShadow = false, hold }: PlayerDrawOptions) => {
  // (talking, in whatever pose: the heads drawn for the moves work their jaws too)
  setTalking(state.playerVulgarityTimer > 0 && !!state.playerLastVulgarity && !p.hidden);
  // (Meathead 2's cat form: every body part drawn after this is the cat's, the grabs' and the weapons' poses too)
  setCatBody(!!p.catForm);
  // (blown to bits by the third one: the mess, and the heap of him, over the death screen too)
  if (p.gut?.remains) { drawBlowout(ctx, p.gut, state.frame); drawRemains(ctx, p.gut.remains, state.frame); return; }
  if ((state.deathTimer > 0 && !p.headless && !p.shownDead) || p.hidden) return;
  const animFrame = state.playerAnimFrame;
  setGore(1 - p.health / INITIAL_PLAYER_HEALTH);
  // (the finale: the hole the alien's laser burned in his jeans, from the cutscene)
  setLegSinge(state.stageId === FINALE_STAGE);
  // (his pants blown off him: naked from the waist down, swinging free; and his jeans and underpants, wherever they went)
  setNude(p.gut?.stage === 3, p.vel.x, p.vel.y, state.frame, p.facing);
  if (p.gut?.stage === 3) drawBlowout(ctx, p.gut, state.frame);
  const gore = getGore();
  ctx.save();
  // (pumped up: drawn bigger, from his feet)
  if (buffs.size !== 1) { const fx0 = p.pos.x + p.width / 2, fy0 = p.pos.y + p.height; ctx.translate(fx0, fy0); ctx.scale(buffs.size, buffs.size); ctx.translate(-fx0, -fy0); }
  // (turned as a whole, about his feet: sat in a cart going up a loop)
  if (p.spriteRot) { const fx0 = p.pos.x + p.width / 2, fy0 = p.pos.y + p.height; ctx.translate(fx0, fy0); ctx.rotate(p.spriteRot); ctx.translate(-fx0, -fy0); }
  // (squashed with a coaster car rolled over on its side, flipped with one hung under the rail)
  if (p.spriteScaleY !== undefined && p.spriteScaleY !== 1) { const fx0 = p.pos.x + p.width / 2, fy0 = p.pos.y + p.height; ctx.translate(fx0, fy0); ctx.scale(1, p.spriteScaleY); ctx.translate(-fx0, -fy0); }
  // (narrowed side to side, about his middle: turning round in the air, a twist)
  if (p.spriteScaleX !== undefined && p.spriteScaleX !== 1) { const fx0 = p.pos.x + p.width / 2; ctx.translate(fx0, 0); ctx.scale(p.spriteScaleX, 1); ctx.translate(-fx0, 0); }

  // 1. Filth Shield Aura
  if (p.filthShieldTimer && p.filthShieldTimer > 0 && !state.victoryString && showFilthShield) {
    drawFilthShield(ctx, p.pos.x + p.width / 2, p.pos.y + p.height / 2 + stanceDrop(p.stance, !p.isDucking && !p.isSliding && !p.isCharging), animFrame, p.filthShieldTimer);
  }

  // 2. Invincibility / Hurt Flicker
  // (not held on the knife: that's a pose to see)
  const isFlicker = (p.invincibilityTimer > 0 || invincibilityEnabled) && !p.inCutscene && !p.stabbed && Math.floor(animFrame / 2) % 2 === 0;
  if (isFlicker) {
    ctx.globalAlpha = 0.45;
  }

  // White flash for the first few frames of taking damage
  if (p.hurtTimer && p.hurtTimer > PLAYER_INVINCIBILITY_FRAMES - 6) ctx.filter = 'brightness(2.4) saturate(0.3)';

  // Recovery animation after being hit mid-special (0 -> 1)
  const hurtT = p.hurtForm && p.hurtFormTimer ? 1 - p.hurtFormTimer / SPECIAL_HURT_FRAMES : -1;

  // Animation States
  // (firing the LMG he doesn't flinch: he just flashes and keeps it going)
  const lmgGrit = p.currentWeapon === 'LMG' && p.shootCooldown > 0;
  // (in the finale he doesn't flinch at a hit either: no hurt pose, he just keeps going)
  const isHurt = !lmgGrit && (p.pushbackTimer > 0 || (p.invincibilityTimer > 40 && state.stageId !== FINALE_STAGE) || hurtT >= 0);
  // A crouch slide has its own pose (drawSlideTackle), not the shoulder-charge afterimages
  const isCharging = p.isCharging && !p.isSliding;
  const isUppercutting = p.isUppercutting;
  const isDivekicking = !!p.isDivekicking;
  const isDucking = p.isDucking || surf;
  // (a moment off the bottom underwater, stepping down it, isn't swimming or a jump: he walks on)
  const offBottom = !p.isGrounded && !(p.swimming && (p.offGround ?? 99) <= 5 && Math.abs(p.vel.y) < 1.5);
  const onFeet = !offBottom;
  const isAirborne = offBottom;
  // In the water (off the bottom): arms stroking, legs kicking; freestyle when he's going somewhere, treading water when he isn't
  const isSwimming = !!p.swimming && offBottom && hurtT < 0;
  // (stretched out flat he's a lot longer than he is stood up: up against a wall or a pipe, he treads water instead,
  // so he never pokes through it)
  const swimRoom = { x: p.pos.x - 30, y: p.pos.y + 8, w: p.width + 60, h: p.height - 16 };
  const cramped = isSwimming && state.blocks.some(b => b.type !== 'pit' && !b.oneWay && b.x < swimRoom.x + swimRoom.w && b.x + b.w > swimRoom.x && b.y < swimRoom.y + swimRoom.h && b.y + b.h > swimRoom.y);
  const swimMoving = isSwimming && Math.abs(p.vel.x) > 0.8 && !cramped;
  // (on skis he glides in a stance rather than running)
  const isWalking = !p.skiing && onFeet && Math.abs(p.vel.x) > 0.4 && !isCharging && !isDucking && !isDivekicking;
  const isIdle = onFeet && !isWalking && !isCharging && !isDucking && !isUppercutting && !isDivekicking && !isHurt;
  // Victory lap after a weakness kill: weapon put away, and both hands on the job while he pisses
  // (or holstered for a stretch: the log ride, Meathead 2's: empty fists)
  const isUnarmed = (!!state.bossCorpse && !!state.victoryString) || !!p.holstered;
  const pee = peeProgress(p.peeTimer);
  const isRelieving = isUnarmed && pee.busy;
  // Grim determination after a charge that didn't kill (like the Doom guy's rampage face)
  const isAngry = !!p.angryTimer && p.angryTimer > 0 && !isHurt && !isRelieving;
  // Sat astride the jet ski: knees forward, off-hand on the handlebars (the gun hand's free)
  const isSeated = (!!p.jetski || !!p.cartSeat || !!p.logSeat) && hurtT < 0;
  // (in a mine cart: sat back in it, relaxed, an arm over the back)
  const lounging = isSeated && !p.jetski;
  // (in a log-flume log: the cart's seat, but sat up in it, the free hand gripping its side, the gun out)
  const logSeated = lounging && !!p.logSeat;
  // Hanging off a vine by one hand (the gun in the other): its own poses, the push among them (not the charge's)
  const vine = p.vine && hurtT < 0 && !p.headless ? p.vine : null;
  const vineMode = vine?.mode;
  // (on a ladder, Meathead 2's: he's on a vine, hanging, as far as everything else knows; these are his poses on it)
  const ladder = vine && p.ladder ? p.ladder : null;
  // On skis: a racer's crouch going along (knees bent, leaning into it, the off arm back for balance), knees tucked up
  // in the air, and right down in an egg tuck ducking
  const isSki = !!p.skiing && !p.jetski && hurtT < 0 && !isCharging && !isUppercutting && !isDivekicking;
  // Rolling a floating log under his feet (Meathead 2's Wilderness Land): feet pedaling on its top, the free arm out
  // for balance, leaning with the wobble
  const logRoll = p.logRoll && onFeet && hurtT < 0 && !isCharging && !isUppercutting && !isDivekicking && !isDucking && !vine ? p.logRoll : null;
  // ...and crouched down on it (under a low branch): squatting low, the free hand down on the log in front gripping it,
  // the boots shuffling round its top as he drives it on from down there
  const logCrouch = p.logRoll && onFeet && hurtT < 0 && isDucking && !isCharging && !isUppercutting && !isDivekicking && !vine && !isSeated && !isSki ? p.logRoll : null;
  // The finale's boulder: pitched, the whole of him in it (render/player/pitch.ts): how far through it he is (-1: not)
  const pitchK = p.throwPitch && (p.throwTimer || 0) > 0 && hurtT < 0 && !isCharging && !isUppercutting && !isDivekicking && !isSwimming && !isSeated && !isDucking
    ? 1 - p.throwTimer! / PITCH_FRAMES : -1;

  // On a slope or stairs (p.stance): drawn down onto the ground under him. Stood or walking, onto his downhill foot,
  // each foot put down on whatever's under it (drawSlopeLeg); in any other pose, only onto the higher foot
  const slopeLegs = !!p.stance && (isWalking || isIdle) && !isHurt && !isRelieving && !isSki && !isSeated && !surf && !p.headless;
  const drop = stanceDrop(p.stance, slopeLegs);

  // Set local coordinate frame: (0, 0) is at player feet center
  const anchorX = p.pos.x + p.width / 2;
  const anchorY = p.pos.y + p.height + drop;
  // (the ground under him there, along from his middle the way he's facing, below his feet: one look for the run he's
  // on, then its slope or treads; a foot on stairs goes on the higher of the treads under its heel and toe)
  let footRun: GroundRun | undefined;
  const groundAt = (lx: number): { y: number; angle: number } | null => {
    const wx = anchorX + p.facing * lx;
    const r = footRun = runAt(state.groundRuns, wx, footRun);
    if (!r) return null;
    if (!r.steps) return { y: treadYAt(r, wx) - anchorY, angle: Math.atan(((r.y2 - r.y1) / (r.x2 - r.x1)) * p.facing) * 0.6 };
    const heel = runAt(state.groundRuns, wx - 5, r), toe = runAt(state.groundRuns, wx + 5, r);
    return { y: Math.min(heel ? treadYAt(heel, wx - 5) : Infinity, toe ? treadYAt(toe, wx + 5) : Infinity) - anchorY, angle: 0 };
  };
  // Which way it goes, the way he's facing (+ up ahead), from the ground either side of him
  const grade = p.stance ? ((p.facing > 0 ? p.stance.l - p.stance.r : p.stance.r - p.stance.l) / (STANCE * 2)) : 0;
  // The body goes into an offscreen sprite (origin at his feet) so it gets a cartoon outline
  const world = ctx;
  // His shadow: thrown from his silhouette as he's drawn (below), or, on a vehicle the stage draws or drawn anywhere
  // but the world, just a pool under him
  const throwShadow = castShadow && !p.jetski && typeof document !== 'undefined';
  if (!throwShadow) drawPlayerShadow(world, p, state, anchorX, anchorY, null);
  const sprite = beginSprite(world);
  if (sprite) ctx = sprite;
  ctx.save();
  if (!sprite) ctx.translate(anchorX, anchorY);
  // (on the jet ski, shooting back: he stays sat facing forward, and just his head and gun arm turn round, below)
  const seatedBack = !!p.jetski && p.facing === -1 && !p.isCharging && !p.isUppercutting && !p.isDivekicking;
  ctx.scale(seatedBack ? 1 : p.facing, 1);
  // (headless: stood there a beat, then over backward, onto the ground)
  if (p.headless) { const k = Math.min(1, Math.max(0, (p.headless - 25) / 30)); ctx.translate(0, -k * k * 12); ctx.rotate(-k * k * 1.5); }
  // (in a space suit: the suit on him, unless it's been blown off him (just the helmet left, naked))
  const suitOn = !!p.spaceSuit && p.gut?.stage !== 3;
  const finishBody = () => {
    ctx.restore();
    ctx = world;
    // (sooted: black all over, fading back, just the whites of his eyes and a wisp of smoke off him)
    const soot = p.sootTimer && p.sootTimer > 0 ? Math.min(1, p.sootTimer / SOOT_FADE) : 0;
    // (in the water, up against a wall or a pipe: whatever he's holding out stops at it, it doesn't poke through)
    const walls = p.swimming ? state.blocks.filter(b => b.type !== 'pit' && !b.oneWay && b.y < anchorY - 4 && b.y + b.h > p.pos.y - 60 && b.x < anchorX + 100 && b.x + b.w > anchorX - 100) : [];
    if (walls.length) { world.save(); world.beginPath(); world.rect(anchorX - 220, anchorY - 320, 440, 420); for (const b of walls) world.rect(b.x, b.y, b.w, b.h); world.clip('evenodd'); }
    if (sprite) endSprite(world, anchorX, anchorY, playerTint(p), throwShadow ? sil => drawPlayerShadow(world, p, state, anchorX, anchorY, sil) : undefined, suitOn ? 10 : undefined);
    // (a shat space suit: the stain over the suit's white, where his jeans' would be)
    if (suitOn && p.gut?.stage === 2 && !p.swimming) { world.save(); world.translate(anchorX, anchorY); world.scale(p.facing, 1); drawShitPants(world, isDucking ? -16 : -26, isDucking ? 10 : 20); world.restore(); }
    if (walls.length) world.restore();
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
    if (p.spaceSuit && eye) drawSpaceHelmet(world, eye.x, eye.y, eye.angle, p.facing);
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
  const airStretch = !p.isGrounded && !isSpecial && !p.swimming && !vine ? Math.min(1, Math.abs(p.vel.y) / PLAYER_TERMINAL_VELOCITY) * 0.1 : 0;
  const squash = p.squash || 0;
  ctx.scale(1 + squash * 0.25 - airStretch * 0.5, 1 - squash * 0.25 + airStretch);

  // A cartoon tuxedo cat (Meathead 2's cartoon White House): his own frames for all of it (render/player/catBody.ts);
  // the gun's a hairball (nothing in his paw), any other weapon held in his paw
  if (p.catForm && !p.headless) {
    const g = p.gut, shat = g?.stage === 2;
    const armed = !isUnarmed && !outOfRocks(p, currentWeapon) && !((p.throwTimer || 0) > 0);
    drawCatPlayer(ctx, p, state, {
      frame: animFrame, hairball: currentWeapon === 'GUN', hurt: isHurt, angry: isAngry,
      hold: armed ? (c, x, y) => (hold ? hold(c, x, y) : drawHeldWeapon(c, currentWeapon, x, y, p.flameAngle || 0, animFrame)) : null,
    });
    finishBody();
    if (shat && !p.swimming) drawStink(ctx, p.pos.x + p.width / 2 - p.facing * 14, anchorY - 22, animFrame);
    ctx.restore();
    return;
  }

  // Hauling on a lever over his head with both hands: seen from behind, his fists on its grip, the weapon put away
  // (render/player/ladder.ts)
  if (p.leverPull && hurtT < 0 && !p.headless && p.health > 0) {
    const lp = p.leverPull, g = p.gut;
    drawOverheadPull(ctx, { ...lp, gx: (lp.gx - anchorX) * p.facing, gy: lp.gy - anchorY, ang: p.facing > 0 ? lp.ang : Math.PI - lp.ang, lean: lp.lean * p.facing },
      animFrame, { nude: g?.stage === 3, shat: g?.stage === 2 });
    finishBody();
    ctx.restore();
    return;
  }
  // A long fall out of his hands, and the landing at the bottom: undignified, its own pose (render/player/freefall.ts)
  if (p.freefall && hurtT < 0 && !p.headless && p.health > 0) {
    const g = p.gut;
    const shat = g?.stage === 2;
    drawFreefall(ctx, p.freefall, animFrame, { nude: g?.stage === 3, shat }, p.facing);
    finishBody();
    if (shat) drawStink(ctx, anchorX - p.facing * 10, anchorY - 30, animFrame);
    ctx.restore();
    return;
  }
  // With a fire extinguisher (a cutscene's): its own poses, the can drawn with him (render/player/extinguisher.ts)
  if (p.extinguisher && hurtT < 0 && !p.headless && p.health > 0) {
    const g = p.gut;
    const shat = g?.stage === 2;
    drawExtinguisherPose(ctx, p.extinguisher, animFrame, { nude: g?.stage === 3, shat });
    finishBody();
    if (shat) drawStink(ctx, anchorX - p.facing * 10, anchorY - 30, animFrame);
    ctx.restore();
    return;
  }
  // Sat in Meathead 2's helicopter, a passenger or flying it: its own poses (render/player/copterPose.ts); a cutscene
  // kick (out of his seat at the pilot) takes over
  if (p.copterSeat && !((p.kickPose || 0) > 0) && hurtT < 0 && !p.headless && p.health > 0) {
    const g = p.gut, shat = g?.stage === 2;
    drawCopterSeatPose(ctx, p.copterSeat, animFrame, { nude: g?.stage === 3, shat });
    finishBody();
    if (shat) drawStink(ctx, anchorX - p.facing * 10, anchorY - 30, animFrame);
    ctx.restore();
    return;
  }
  // On a dragon coaster's back, no gun (Meathead 2's Truelling Tragons): its own poses, hurt or not
  // (render/player/tragonPose.ts)
  if (p.tragon && !p.headless && p.health > 0) {
    const g = p.gut, shat = g?.stage === 2;
    drawTragonPose(ctx, { ...p.tragon, hurt: p.tragon.hurt || hurtT >= 0 }, animFrame, { nude: g?.stage === 3, shat });
    finishBody();
    if (shat) drawStink(ctx, anchorX - p.facing * 10, anchorY - 30, animFrame);
    ctx.restore();
    return;
  }
  // Astride a broomstick (Meathead 2's Fairy Land runway): its own pose (render/player/broomPose.ts)
  if (p.broomRide && !p.headless && p.health > 0) {
    const g = p.gut, shat = g?.stage === 2;
    drawBroomRidePose(ctx, p.broomRide, animFrame, { nude: g?.stage === 3, shat }, hurtT >= 0);
    finishBody();
    if (shat) drawStink(ctx, anchorX - p.facing * 10, anchorY - 30, animFrame);
    ctx.restore();
    return;
  }
  // Sat on a toilet, pants down, going (Meathead 2's star toilets): its own pose (render/player/throne.ts)
  if (p.throne && hurtT < 0 && !p.headless && p.health > 0) {
    const g = p.gut;
    drawThronePose(ctx, p.throne, animFrame, { nude: g?.stage === 3, shat: g?.stage === 2 });
    finishBody();
    ctx.restore();
    return;
  }
  // On a ladder, climbing or sliding down it: seen from behind, facing into it (render/player/ladder.ts)
  if (ladder && ladder.mode !== 'hang') {
    const g = p.gut;
    drawLadderClimb(ctx, ladder, animFrame, { nude: g?.stage === 3, shat: g?.stage === 2 },
      c => { if (!isUnarmed && !outOfRocks(p, currentWeapon)) drawHeldWeapon(c, currentWeapon, 0, 0, 0, animFrame); });
    finishBody();
    ctx.restore();
    return;
  }
  if (p.isSliding && !p.headless) {
    drawSlideTackle(ctx, animFrame, currentWeapon, isUnarmed || outOfRocks(p, currentWeapon));
    finishBody();
    ctx.restore();
    return;
  }
  // The special moves are full poses of their own (unless he's been knocked out of one)
  const movePose = hurtT >= 0 || p.headless || vine ? null
    // (on the jet ski they're the ski's moves: a wheelie, a leap out of the water, a nose-first dive)
    : p.jetski ? (isCharging ? drawJetskiWheelie : isUppercutting ? drawJetskiLeap : isDivekicking ? drawJetskiDive : null)
    // (booting somebody off his skis, boat or jet ski: a big standing front kick)
    // (dropped down through a ledge: arms up, legs together, straight down)
    : (p.ledgeDrop || 0) > 0 && !p.isGrounded && !p.swimming && !isCharging && !isUppercutting && !isDivekicking ? (c: CanvasRenderingContext2D, fr: number) => drawLedgeDrop(c, fr, 1 - (p.ledgeDrop || 0) / LEDGE_DROP_FRAMES)
    // (an axe: Meathead 2's Tucker's arena entry)
    : p.axeSwing !== undefined ? (c: CanvasRenderingContext2D, fr: number) => drawAxeSwing(c, fr, p.axeSwing ?? 0)
    : (p.kickPose || 0) > 0 && !isDivekicking ? (c: CanvasRenderingContext2D, fr: number) => drawStandingKick(c, fr, 1 - (p.kickPose || 0) / KICK_POSE_FRAMES)
    // (squared up for a duel: Meathead 2's showdown)
    : p.gunslinger && p.isGrounded && !isCharging && !isUppercutting && !isDivekicking ? (c: CanvasRenderingContext2D, fr: number) => drawGunslinger(c, fr, cc => drawHeldWeapon(cc, currentWeapon, 0, 0, 0, fr))
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
  // (on the flat: lowest with his feet apart, a moment after the front one lands and takes the weight; up over the
  // leg he's standing on as the other passes it)
  const walkBob = 2.2 * (1 - Math.abs(Math.cos(walkPhase - 0.3)));
  // (going backward, facing the other way: a backpedal, slower, its own steps)
  const backpedal = isWalking && !slopeLegs && Math.sign(p.vel.x) === -p.facing;
  const backPhase = (animFrame * 0.22) % (Math.PI * 2);
  // 0 rising fast .. 1 falling fast
  const airFall = Math.max(0, Math.min(1, (p.vel.y + 6) / 12));

  // Dynamic rotation & vertical offsets based on stance
  let bodyRot = 0;
  let bodyY = 0;
  let spinAroundCenter = false;
  /** On a vine: where his hand's round it (his local frame), and how his body hangs off it. */
  const GRIP: [number, number] = [vineGrip(p).x, vineGrip(p).y];
  // (mid-move with what's in his free hand, a swing or a cast: that arm the weapon's own way, level from the shoulder)
  // (not mid push or quick climb: those have the arm)
  const vineArm = vine && !isCharging && !isUppercutting && !isDivekicking && (!ladder || ladder.mode === 'hang') ? customWeapon(currentWeapon)?.vineArm?.(state) ?? null : null;
  if (vine) {
    // Along the vine, a bit behind it (his weight lags the swing); leaning into the push, tucked in a quick climb
    // (on a ladder: upright, his hands and feet on the rungs; leaning in, his shoulder bounced off it)
    bodyRot = ladder ? (ladder.shove ?? 0) * 0.2 : vineLean(p);
    bodyY = vineMode === 'climb' && !ladder ? Math.sin(animFrame * 0.3) * 2.5 : 0;
  } else if (p.stabbed) {
    // Held on the knife: hunched round it, up on his toes; at each stab he doubles over and jerks, then sags back
    const st = p.stabbed;
    if (st.hunch !== undefined) { bodyRot = st.hunch; bodyY = isDucking ? 0 : 2; }
    else { const l = stabLean(st); bodyRot = l.rot + Math.sin(animFrame * 1.3) * 0.02; bodyY = l.y; }
  } else if (hurtT >= 0) {
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
  } else if (lounging && isDucking) {
    // Ducked right down in it, hunched over, under whatever's coming
    bodyRot = 0.5;
    bodyY = 5;
  } else if (logSeated) {
    // Sat up in the log, legs out in front of him down in it, bobbing with the water
    bodyRot = -0.07;
    bodyY = 2 + Math.sin(animFrame * 0.12) * 0.8;
  } else if (lounging) {
    // Leaning back against the back of the cart, at his ease, rocking with the rails
    bodyRot = -0.3;
    bodyY = 3 + Math.sin(animFrame * 0.2) * 0.8;
  } else if (isSeated) {
    // Sat up straight, riding the chop (leaning back into the landings)
    bodyRot = isAirborne ? -0.12 : -0.04;
    bodyY = Math.sin(animFrame * 0.18) * 1.2;
  } else if (isSki) {
    if (isDucking) { bodyRot = 0.34; bodyY = 0; }
    else if (isAirborne) { bodyRot = -0.06 + airFall * 0.12; bodyY = -2; }
    else { bodyRot = 0.16; bodyY = -4 + Math.sin(animFrame * 0.15) * 0.8; }
  } else if (isHurt) {
    bodyRot = -0.3; // Reeling back in pain/shock
    bodyY = 2;
  } else if (logRoll) {
    // On the log: leaning with the wobble, bobbing as each foot comes down on it
    bodyRot = logRoll.lean * p.facing * 0.35 + 0.06;
    bodyY = -2 - Math.abs(Math.sin(logRoll.spin * 2)) * 1.6;
  } else if (logCrouch) {
    // Crouched on the log: hunched forward over it, rocking with the wobble, bobbing as each boot comes down
    bodyRot = 0.18 + logCrouch.lean * p.facing * 0.25;
    bodyY = -1 - Math.abs(Math.sin(logCrouch.spin * 2)) * 1.2;
  } else if (isDucking) {
    bodyRot = 0.05; // Slight forward combat crouch angle
    bodyY = 0; // Feet remain firmly planted on the ground level (0)!
  } else if (isWalking) {
    // (on a slope or stairs: at his highest passing one foot by the other, his lowest with them apart; and carried a
    // little higher than he stands there, the steeper it is, the foot down the slope pushing off its toe)
    bodyY = slopeLegs ? -(1 - Math.abs(walkStride)) * 1.5 - Math.min(4, Math.abs(p.stance!.l - p.stance!.r) * 0.35) : backpedal ? 1.6 * (1 - Math.abs(Math.cos(backPhase - 0.3))) : walkBob;
  } else if (isIdle) {
    bodyY = -idleBreath * 0.5;
  } else if (isSwimming) {
    bodyRot = swimMoving ? 0.3 : 0.02;
    bodyY = Math.sin(animFrame * 0.12) * 2;
  } else if (isAirborne) {
    bodyRot = -0.09 + airFall * 0.16; // leaning back on the way up, forward coming down
  }

  // Lean into the run
  if (isWalking && hurtT < 0) bodyRot += Math.sign(p.vel.x) * p.facing * Math.min(1, Math.abs(p.vel.x) / PLAYER_MOVE_SPEED) * 0.07;
  // ...and uphill, whichever way he's going: into the climb going up, back against it coming down (not the gun: below)
  const slopeLean = slopeLegs && isWalking ? Math.max(-1, Math.min(1, grade)) * (grade * Math.sign(p.vel.x) * p.facing > 0 ? 0.07 : 0.12) : 0;
  bodyRot += slopeLean;
  if (pitchK >= 0) { const lean = p.throwKeg ? kegLean(pitchK) : pitchLean(pitchK); bodyRot = lean.rot * (isAirborne ? 0.5 : 1); bodyY = lean.y; }

  if (vine) {
    // (turned about his hand on the vine: that stays put)
    ctx.translate(GRIP[0], GRIP[1] + bodyY);
    ctx.rotate(bodyRot);
    ctx.translate(-GRIP[0], -GRIP[1]);
  } else if (spinAroundCenter) {
    ctx.translate(0, bodyY - 32);
    ctx.rotate(bodyRot);
    ctx.translate(0, 32);
  } else {
    ctx.translate(0, bodyY);
    ctx.rotate(bodyRot);
  }

  // ==========================================
  // LAYER 1: BACK ARM (Off-Hand)
  // (standing about, walking and in the air it hangs in front of him instead: this draws it, over the torso)
  let freeArm: (() => void) | null = null;
  // ==========================================
  ctx.save();
  if (ladder) {
    drawLadderBackArm(ctx, ladder);
    if (vineArm) { ctx.save(); ctx.translate(VINE_SHOULDER.x, VINE_SHOULDER.y); ctx.rotate(-bodyRot); ctx.translate(-VINE_SHOULDER.x, -VINE_SHOULDER.y); vineArm(ctx, animFrame, 14, -45, true); ctx.restore(); }
  } else if (vine) {
    // Up over his head, the fist round the vine (climbing: hand over hand, the arm hauling him up to it and reaching
    // again; in a quick climb, yanking; sliding down, clamped on, the rope smoking in his fist)
    const ph = animFrame * 0.3;
    const reach = vineMode === 'climb' ? Math.sin(ph) * 7 : vineMode === 'zipUp' ? Math.sin(animFrame * 0.9) * 5 : 0;
    const fist: [number, number] = [GRIP[0], GRIP[1] - (vineMode === 'climb' ? reach - bodyY : 0)];
    const sh: [number, number] = [-9, -46];
    const el: [number, number] = [(sh[0] + fist[0]) / 2 - 5, (sh[1] + fist[1]) / 2 + 2];
    drawArmTo(ctx, sh, el, fist, true, 5.5);
    if (vineMode === 'zipDown') {
      // (rope burn)
      for (let k = 0; k < 3; k++) { const t = ((animFrame + k * 5) % 15) / 15; ctx.fillStyle = `rgba(214, 211, 209, ${0.55 * (1 - t)})`; ctx.beginPath(); ctx.arc(fist[0] + Math.sin(k * 2.3 + animFrame) * 3, fist[1] - 4 - t * 14, 2 + t * 4, 0, Math.PI * 2); ctx.fill(); }
    }
    // (whatever of his weapon arm's round behind him)
    if (vineArm) { ctx.save(); ctx.translate(VINE_SHOULDER.x, VINE_SHOULDER.y); ctx.rotate(-bodyRot); ctx.translate(-VINE_SHOULDER.x, -VINE_SHOULDER.y); vineArm(ctx, animFrame, 14, -45, true); ctx.restore(); }
  } else if (surf) {
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
  } else if (lounging && isDucking) {
    // Ducked: hunched right over, both hands gripping the front of the cart, head down
    drawReachingArm(ctx, -6, -40, 6, -30, 18, -28, skinShadow);
    ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.arc(18, -28, 4.5, 0, Math.PI * 2); ctx.fill();
  } else if (logSeated) {
    // Down at his side, gripping the log's rim
    drawReachingArm(ctx, -6, -40, -12, -32, -9, -24, skinShadow);
    ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.arc(-9, -24, 4.5, 0, Math.PI * 2); ctx.fill();
  } else if (lounging) {
    // Draped back over the back of the cart, open, the hand resting on the top of it
    drawReachingArm(ctx, -8, -42, -22, -48, -18, -60, skinShadow);
    ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.arc(-18, -60, 4.5, 0, Math.PI * 2); ctx.fill();
  } else if (isSeated) {
    // Reaching forward to the handlebars
    drawReachingArm(ctx, -6, -40, 6, -35, 21, -40, skinShadow);
    ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.arc(20, -40, 4.5, 0, Math.PI * 2); ctx.fill();
  } else if (p.stabbed) {
    // Held on the knife (or gutted): the hand clamped over the hole in his belly, blood out between the fingers (shoved
    // up into it, stuffing them back in)
    const st = p.stabbed, push = st.hand ?? 0;
    // (held on it: the hand clawing at the hole just under the blade)
    const live = st.hunch === undefined;
    const fx = (isDucking ? 9 : live ? 10 : 8) - push * 2, fy = (isDucking ? -21 : live ? -26 : -32) + push * 3 + (live ? Math.sin(animFrame * 0.9) * 0.6 : 0);
    freeArm = () => {
      drawArm(ctx, -15, isDucking ? -32 : -45, -9, isDucking ? -18 : -30, fx - 4, fy + 1, skinTone, skinShadow, skinHighlight);
      ctx.fillStyle = '#991B1B'; ctx.fillRect(fx - 2, fy + 3, 3, 2); ctx.fillRect(fx + 2, fy - 1, 2, 3);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(fx - 1, fy + 5, 2, 2 + (animFrame >> 2) % 4); ctx.fillRect(fx + 3, fy + 2, 1, 2 + (animFrame >> 3) % 3);
    };
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
  } else if (pitchK >= 0) {
    // Pitching: the glove arm (over the torso, below)
    freeArm = () => (p.throwKeg ? drawKegGloveArm : drawPitchGloveArm)(ctx, pitchK);
  } else if (logCrouch) {
    // Crouched on the log: the free hand reaching down to it in front of him, gripping on, sliding along it as it
    // turns (drawn over the torso, below)
    const pat = Math.sin(logCrouch.spin * 1.6) * 3;
    freeArm = () => drawArm(ctx, -15, -30, -6, -16, 7 + pat, -3, skinTone, skinShadow, skinHighlight);
  } else if (isDucking) {
    // Crouched: the arm down at his side in front of him, the fist resting on his thigh (drawn over the torso, below)
    freeArm = () => drawArm(ctx, -15, -30, -17, -19, -13, -11, skinTone, skinShadow, skinHighlight);
  } else if (isRelieving) {
    // Reaching down and forward to hold it (the hand itself is drawn with it, over the top)
    drawReachingArm(ctx, -6, -40, -1, -30, 7, -22, skinShadow);
  } else {
    // Idle / Walk pumping arm in opposition
    // Held a little back while he's in the air
    // Walking: the upper arm swings from the shoulder against his stride (not far: it's a heavy arm), and the elbow
    // bends forward, closing as the arm comes forward and opening as it goes back, a beat behind the swing. Standing:
    // hanging, the elbow a little bent, easing with his breathing.
    // Swimming somewhere, he doesn't do the crawl: he hauls himself through the water one-armed like it's a lat
    // pulldown, the arm up high behind his head, then a hard yank down to his hip, the elbow driving down and the fist
    // coming down past his ear, and back up for another rep, elbow first, slower (never round past his face)
    const swimHaul = (() => {
      const ph = (animFrame * 0.035) % 1;
      if (ph < 0.42) { const t = ph / 0.42, e = t * t * (3 - 2 * t); return { angle: 2.9 - 2.45 * e, bend: -1.6 * Math.sin(Math.PI * t) }; }
      const t = (ph - 0.42) / 0.58, e = t * t * (3 - 2 * t);
      return { angle: 0.45 + 2.45 * e, bend: 1.1 * Math.sin(Math.PI * t) };
    })();
    // Shrugging (tried to throw a boulder with none left): the free arm out from his side, the forearm up, palm up
    const shrug = shrugK(p, state.frame);
    const armAngle0 = logRoll ? 1.5 + Math.sin(animFrame * 0.21) * 0.45 - logRoll.lean * p.facing * 0.6
      : isSki ? (isAirborne ? 2.0 + Math.sin(animFrame * 0.2) * 0.1 : 0.85 + Math.sin(animFrame * 0.12) * 0.06)
      : isSwimming ? (swimMoving ? swimHaul.angle : 0.9 + Math.sin(animFrame * 0.15) * 0.9)
      : isWalking ? 0.16 - walkStride * 0.42
      // (in the air: thrown up high behind him on the way up, coming down and out behind for balance as he falls)
      : isAirborne ? 2.5 - airFall * 1.2
      : 0.2 + Math.sin(animFrame * 0.05) * 0.04;
    const armAngle = armAngle0 + (0.6 - armAngle0) * shrug;
    const bend0 = isSwimming ? (swimMoving ? swimHaul.bend : 0.2)
      : isWalking ? 0.12 + Math.max(0, -Math.sin(walkPhase - 0.55)) * 0.5
      : isAirborne ? 0.45
      : 0.14 + Math.sin(animFrame * 0.05 + 0.8) * 0.05;
    const bend = bend0 + (2.5 - bend0) * shrug;
    // (in front of his body, not behind it: drawn once the torso's down, below)
    freeArm = () => {
      ctx.save();
      ctx.translate(-15, -45);
      ctx.rotate(armAngle);
      drawArm(ctx, 0, 0, -0.5, 12, Math.sin(bend) * 10 - 0.5, 12 + Math.cos(bend) * 10, skinTone, skinShadow, skinHighlight);
      if (gore > 0.4) smear(ctx, -1, 4, 4, 3, bloodDark);
      if (gore > 0.7) drip(ctx, 0, 5, 8);
      ctx.restore();
    };
  }
  ctx.restore();

  // ==========================================
  // LAYER 2: LEGS & BOOTS
  // ==========================================
  ctx.save();
  if (ladder) {
    drawLadderLegs(ctx, ladder);
  } else if (vine) {
    const sway = Math.max(-0.5, Math.min(0.5, -vine.om * 6 * p.facing));
    if (vineMode === 'climb') {
      // Shinning up it: the knees coming up in turn, the boots clamping
      const k = Math.sin(animFrame * 0.3);
      drawJointedLeg(ctx, -4, -22, -0.45 - Math.max(0, k) * 0.7, 0.9 + Math.max(0, k) * 0.9, pantsShadow, false);
      drawJointedLeg(ctx, 5, -22, -0.45 - Math.max(0, -k) * 0.7, 0.9 + Math.max(0, -k) * 0.9, pantsColor, true);
    } else if (vineMode === 'zipUp') {
      // Knees tucked right up, yanked up it
      drawJointedLeg(ctx, -4, -22, -1.25, 2.1, pantsShadow, false);
      drawJointedLeg(ctx, 5, -22, -1.05, 1.9, pantsColor, true);
    } else if (vineMode === 'zipDown') {
      // Legs straight down together, toes pointed: dropping down it
      drawJointedLeg(ctx, -4, -22, 0.06, 0.05, pantsShadow, false);
      drawJointedLeg(ctx, 5, -22, -0.04, 0.08, pantsColor, true);
    } else if (vineMode === 'push') {
      // Legs flung back behind him, driving into the swing
      drawJointedLeg(ctx, -4, -22, 0.95, 0.55, pantsShadow, false);
      drawJointedLeg(ctx, 5, -22, 0.7, 0.85, pantsColor, true);
    } else {
      // Hanging: legs loose, a little apart, trailing the swing
      drawJointedLeg(ctx, -4, -22, 0.16 + sway, 0.3 + Math.abs(sway) * 0.3, pantsShadow, false);
      drawJointedLeg(ctx, 5, -22, -0.22 + sway, 0.45 + Math.abs(sway) * 0.3, pantsColor, true);
    }
  } else if (pitchK >= 0 && !isAirborne) {
    // Pitching: the leg kick, the stride, the back leg up behind him
    (p.throwKeg ? drawKegLegs : drawPitchLegs)(ctx, pitchK);
  } else if (isDivekicking) {
    // (knocked out of a move, or headless: the moves' own legs, without the rest of the pose)
    // Rear leg tucked, lead leg thrust out forward-down, steel toe leading
    drawLeg(ctx, [-4, -22], [-10, -12], [-14, -6], 0.3, true);
    drawLeg(ctx, [4, -22], [12, -14], [20, -6], 0.6, false);
  } else if (isUppercutting) {
    // Back leg trailing straight down, lead knee driven up
    drawLeg(ctx, [-4, -22], [-5, -10], [-6, 0], 1.2, true);
    drawLeg(ctx, [5, -22], [15, -28], [16, -14], 1.3, false);
  } else if (isCharging) {
    // The sprint
    const u = ((animFrame * 0.55) / (Math.PI * 2)) % 1;
    sprintLeg(ctx, [-4, -22], (u + 0.5) % 1, true);
    sprintLeg(ctx, [4, -22], u, false);
  } else if (logRoll) {
    // On the log: feet pedaling round its top, each knee coming up in turn as the log turns under it
    const ph = logRoll.spin * 1.6;
    for (const [hip, off, col, near] of [[-4, Math.PI, pantsShadow, false], [5, 0, pantsColor, true]] as const) {
      const s = Math.sin(ph + off), up = Math.max(0, Math.cos(ph + off));
      drawJointedLeg(ctx, hip, -22, -0.25 + s * 0.45 - up * 0.35, 0.35 + up * 0.85, col, near);
    }
  } else if (isSeated && p.bike) {
    // On the bike: feet on the pedals, going round (how far round's how far he's gone)
    drawPedalLegs(ctx, p.pos.x / 14);
  } else if (isSki && !isDucking) {
    if (isAirborne) {
      // Knees tucked up under him, skis together
      drawJointedLeg(ctx, -4, -22, -1.0, 1.9, pantsShadow, false);
      drawJointedLeg(ctx, 5, -22, -1.1, 2.0, pantsColor, true);
    } else {
      // The racer's crouch: knees bent forward over the boots, weight forward
      drawJointedLeg(ctx, -4, -22, -0.55, 1.05, pantsShadow, false);
      drawJointedLeg(ctx, 5, -22, -0.62, 1.1, pantsColor, true);
    }
  } else if (lounging && isDucking) {
    // Ducked in the cart: knees pulled right up, boots tucked back under him (hunched over, nothing pokes out under it)
    drawJointedLeg(ctx, -4, -22, -2.25, 2.75, pantsShadow, false);
    drawJointedLeg(ctx, 5, -22, -2.3, 2.8, pantsColor, true);
  } else if (isSeated) {
    // Astride the seat: thighs out forward, shins down into the footwell
    drawJointedLeg(ctx, -4, -22, -1.3, 1.2, pantsShadow, false);
    drawJointedLeg(ctx, 5, -22, -1.4, 1.25, pantsColor, true);
  } else if (logCrouch) {
    // Crouched on the log, driving it: the squat, the boots shuffling round its top in turn (each one lifting and coming
    // down further on as it turns under him), knees out
    const ph = logCrouch.spin * 1.6;
    const thigh = (side: number, col: string, dx: number, up: number) => {
      ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(side * 6, -14); ctx.lineTo(side * 20 + dx, -10 - up); ctx.lineTo(side * 18 + dx, -6 - up); ctx.lineTo(side * 8, -6);
      ctx.closePath(); ctx.fill();
    };
    const sb = Math.sin(ph + Math.PI) * 4, lb = Math.max(0, Math.cos(ph + Math.PI)) * 2.5;
    const sf = Math.sin(ph) * 4, lf = Math.max(0, Math.cos(ph)) * 2.5;
    thigh(-1, pantsShadow, sb, lb); drawBoot(ctx, -20 + sb, -6 - lb, 14, 6, false);
    thigh(1, pantsColor, sf, lf); drawBoot(ctx, 6 + sf, -6 - lf, 15, 6, true);
    ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.ellipse(17 + sf, -9.5 - lf, 3, 2.5, 0.3, 0, Math.PI * 2); ctx.fill();
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
    // (springing up: the lead knee driven high, the back leg kicked back under him; tucked at the top; coming down,
    // both legs reaching for the ground, a little apart, ready to take the landing)
    const fall = airFall, tuck = Math.max(0, 1 - Math.abs(fall - 0.45) / 0.3);
    const lerp = (a: number, b: number) => a + (b - a) * fall;
    drawJointedLeg(ctx, -4, -22, lerp(0.35, 0.18) - tuck * 0.25, lerp(1.0, 0.15) + tuck * 0.4, pantsShadow, false);
    drawJointedLeg(ctx, 5, -22, lerp(-1.05, -0.2) - tuck * 0.2, lerp(1.45, 0.3) + tuck * 0.2, pantsColor, true);
  } else if (isHurt) {
    // Staggered backwards
    drawPantLeg(ctx, -14, -20, 10, 16, pantsShadow);
    drawBoot(ctx, -16, -4, 13, 6, false);
    drawPantLeg(ctx, 2, -22, 10, 18, pantsColor, true, 0.74);
    drawBoot(ctx, 3, -4, 13, 6, true);
  } else if (isWalking && slopeLegs) {
    // Up or down a slope or stairs: each foot planted on the ground under it, then lifted and swung through to the
    // next. Going up, a shorter stride and a high step, the knee coming right up; coming down, a longer, braking
    // stride, the foot hardly lifted, reaching down for the ground ahead
    const climb = grade * Math.sign(p.vel.x) * p.facing > 0, k = Math.min(1, Math.abs(grade) / 0.6);
    const reach = climb ? 9 - 2.5 * k : 9 + 1.5 * k, lift = climb ? 3 + 5 * k : 2.5 - k;
    const swing = Math.cos(walkPhase);
    const leg = (hipX: number, footX: number, up: number, back: boolean) => {
      const g = groundAt(footX);
      drawSlopeLeg(ctx, hipX, footX, (g ? g.y : 0) - up, up > 0.5 ? (climb ? -0.15 : 0.1) : g ? g.angle : 0, bodyY, bodyRot, back, false);
    };
    leg(-4, -4 + reach * walkStride, Math.max(0, swing) * lift, true);
    leg(4, 4 - reach * walkStride, Math.max(0, -swing) * lift, false);
  } else if (isWalking && backpedal) {
    // Backing up, facing held the other way (aiming, say): shorter, careful steps, the toe reaching back and down first,
    // the foot rolling onto its heel as he comes back over it, then picked up and set back again behind him
    walkBackLeg(ctx, -4, backPhase + Math.PI * 1.5, bodyY, bodyRot, true);
    walkBackLeg(ctx, 4, backPhase + Math.PI * 0.5, bodyY, bodyRot, false);
  } else if (isWalking) {
    // A real stride, a heavy man's: each boot planted flat on the ground and the body carried over it (the foot stays
    // put while he goes by it), the heel lifting and the toe pushing off behind him, then the knee driven up and
    // through, the toe up as it reaches out, the heel coming down first; the hips sinking onto it as it takes the weight
    walkLeg(ctx, -4, walkPhase + Math.PI * 1.5, bodyY, bodyRot, true);
    walkLeg(ctx, 4, walkPhase + Math.PI * 0.5, bodyY, bodyRot, false);
  } else if (isRelieving && pee.drop < 1) {
    // Undoing the belt (pants still up), then the pants dropping: the top of them sliding down his thighs
    const top = -22 + pee.drop * 12;
    ctx.fillStyle = skinShadow; ctx.fillRect(-10, -22, 10, top + 22);
    ctx.fillStyle = skinTone; ctx.fillRect(2, -22, 10, top + 22);
    drawPantLeg(ctx, -10, top, 10, -6 - top, pantsShadow);
    drawPantLeg(ctx, 2, top, 10, -6 - top, pantsColor, true);
    drawBoot(ctx, -11, -6, 12, 7, false);
    drawBoot(ctx, 2, -6, 14, 7, true);
  } else if (isRelieving) {
    // Pants round his ankles: bare thighs (hairy, the light on the front one), the pants bunched down over his boots
    ctx.fillStyle = skinShadow; ctx.fillRect(-10, -22, 10, 15);
    ctx.fillStyle = skinTone; ctx.fillRect(2, -22, 10, 15);
    ctx.fillStyle = skinHighlight; ctx.fillRect(4, -21, 3, 10);
    ctx.fillStyle = 'rgba(80, 40, 15, 0.45)';
    for (let k = 0; k < 10; k++) { const hx = (k % 2 ? 3 : -9) + ((k * 37) % 8), hy = -20 + ((k * 13) % 12); ctx.fillRect(hx, hy, 0.8, 1.6); }
    // (the bunch of them: folds of navy, the waistband turned out on top)
    for (const [bx, c] of [[-11, pantsShadow], [1, pantsColor]] as const) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(bx, -10, 12, 6, 2); ctx.fill();
      ctx.fillStyle = '#0F1B3D'; ctx.fillRect(bx + 2, -8, 8, 0.8); ctx.fillRect(bx + 1, -6, 9, 0.8);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(bx, -10.5, 12, 1.4);
    }
    drawBoot(ctx, -11, -6, 12, 7, false);
    drawBoot(ctx, 2, -6, 14, 7, true);
  } else if (slopeLegs) {
    // Stood on a slope or stairs: each boot down on the ground under it, the uphill knee bent, the downhill leg
    // straight, his hips level; his feet a little closer together the steeper it is (short legs: they'd fold up)
    const narrow = Math.min(1, Math.abs(grade) / 0.6) * 2;
    const gb = groundAt(-5 + narrow), gf = groundAt(9 - narrow);
    drawSlopeLeg(ctx, -5, -5 + narrow, gb ? gb.y : 0, gb ? gb.angle : 0, bodyY, bodyRot, true, false);
    drawSlopeLeg(ctx, 7, 7 - narrow, gf ? gf.y : 0, gf ? gf.angle : 0, bodyY, bodyRot, false, true);
  } else {
    // Idle grounded solid stance
    drawPantLeg(ctx, -10, -22, 10, 16, pantsShadow);
    drawBoot(ctx, -11, -6, 12, 7, false);
    drawPantLeg(ctx, 2, -22, 10, 16, pantsColor, true, 0.72);
    // (the front boot tipping up on its heel when he's tapping his foot)
    ctx.save(); ctx.translate(2, 0); ctx.rotate(-footTap * 0.4); ctx.translate(-2, 0);
    drawBoot(ctx, 2, -6, 14, 7, true);
    // Tread grips
    ctx.fillStyle = '#09090B';
    ctx.fillRect(2, 0, 14, 2);
    ctx.restore();
  }
  ctx.restore();
  // Shit himself (game/player/gut.ts): the seat of his pants soaked through brown, and it's run down his legs
  if (p.gut && p.gut.stage === 2 && !isSwimming) drawShitPants(ctx, isDucking ? -16 : -26, isDucking ? 10 : 20);

  // ==========================================
  // LAYER 3: WEIGHTLIFTING BELT
  // ==========================================
  ctx.save();
  // (undone and gone down with the pants: round his ankles, not round his waist)
  if (isRelieving && pee.drop > 0) {
    const by = -27 + pee.drop * 21;
    ctx.fillStyle = beltColor; ctx.fillRect(-13, by, 26, 4);
    ctx.fillStyle = beltBuckle; ctx.fillRect(-12, by - 1, 6, 6);
    ctx.fillStyle = beltColor; ctx.save(); ctx.translate(13, by + 2); ctx.rotate(0.9); ctx.fillRect(0, -2, 10, 4); ctx.restore();
  } else {
  const beltY = isDucking ? -16 : -27;
  const beltH = isDucking ? 6 : 7;
  drawBelt(ctx, beltY, beltH);
  // (being undone: the strap end pulled free of the buckle, flapping)
  if (isRelieving && pee.undoing && (p.peeTimer || 0) > 8) {
    const flap = Math.sin(animFrame * 0.6) * 0.3;
    ctx.fillStyle = beltColor; ctx.save(); ctx.translate(5, beltY + 3); ctx.rotate(0.6 + flap); ctx.fillRect(0, -3, 12, 6); ctx.restore();
  }
  }
  ctx.restore();

  // ==========================================
  // LAYER 4: TORSO, CHISELED ABS & BULGING PECS
  // ==========================================
  ctx.save();
  const torsoTop = isDucking ? -36 : -50;
  const torsoHeight = isDucking ? 21 : 24;
  const pecY = isDucking ? -34 : -48;
  drawTorso(ctx, torsoTop, torsoHeight, pecY, isDucking);
  ctx.restore();
  freeArm?.();

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
  if (p.deathFace) drawDeathBrows(ctx, p.deathFace, headX, headY);
  else if (isAngry) {
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

  if (p.deathFace) drawDeathEyes(ctx, p.deathFace, lEyeX, rEyeX, eyeY, animFrame);
  else if (p.bossKillSatisfactionTimer > 0) {
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
  if (p.deathFace) drawDeathMouth(ctx, p.deathFace, headX, mouthY, animFrame);
  else if (isUppercutting) {
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
  } else if (state.playerVulgarityTimer > 0 && !!state.playerLastVulgarity) {
    // Talking: the jaw working (the same in every pose: see drawTalkingMouth)
    drawTalkingMouth(ctx, headX, mouthY, animFrame);
  } else if (p.killSatisfactionTimer > 0 || state.victoryString !== "") {
    // A wide, nasty grin: the corners hauled up, every tooth showing
    ctx.fillStyle = '#09090B';
    ctx.beginPath();
    ctx.moveTo(headX - 7, mouthY - 1.5); ctx.lineTo(headX - 4, mouthY + 0.5); ctx.lineTo(headX + 4, mouthY + 0.5); ctx.lineTo(headX + 7, mouthY - 1.5);
    ctx.lineTo(headX + 6, mouthY + 2.2); ctx.quadraticCurveTo(headX, mouthY + 5, headX - 6, mouthY + 2.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(headX - 5.6, mouthY - 0.4); ctx.lineTo(headX - 3.6, mouthY + 1); ctx.lineTo(headX + 3.6, mouthY + 1); ctx.lineTo(headX + 5.6, mouthY - 0.4);
    ctx.lineTo(headX + 5, mouthY + 1.8); ctx.quadraticCurveTo(headX, mouthY + 3.8, headX - 5, mouthY + 1.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#18181B';
    for (const tx of [-3, -1, 1, 3]) ctx.fillRect(headX + tx - 0.3, mouthY + 0.6, 0.6, 2.4);
    // (the cheeks bunched up under the eyes with it)
    ctx.fillStyle = skinShadow; ctx.fillRect(headX - 8, mouthY - 3, 2.5, 1); ctx.fillRect(headX + 5.5, mouthY - 3, 2.5, 1);
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
  drawGlasses(ctx, headX, eyeY);
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
    // The arm tucked in hard, the fist up by his chest; the shoulder leading, swollen up into a ram
    drawArm(ctx, ramX - 1, ramY + 1, ramX - 2, ramY + 12, 5, ramY + 6, skinTone, skinShadow, skinHighlight);
    ctx.fillStyle = skinTone; ctx.beginPath(); ctx.ellipse(ramX, ramY, 8.5, 7.5, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(ramX - 1, ramY + 5, 6, 1.6, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skinHighlight; ctx.beginPath(); ctx.ellipse(ramX + 2.5, ramY - 3, 3.5, 2, 0.3, 0, Math.PI * 2); ctx.fill();
  } else if (lounging && isDucking && !logSeated) {
    // Ducked in the cart: hunched over, gripping the front of it white-knuckled
    drawReachingArm(ctx, 8, -42, 18, -32, 26, -26, skinTone);
    ctx.fillStyle = skinTone; ctx.beginPath(); ctx.arc(26, -26, 5, 0, Math.PI * 2); ctx.fill();
  } else if (lounging && !logSeated) {
    // Sat back in the cart, nothing in his hand: the arm along the front of it, the hand over the side
    drawReachingArm(ctx, 8, -42, 20, -34, 30, -32, skinTone);
    ctx.fillStyle = skinTone; ctx.beginPath(); ctx.arc(30, -32, 5, 0, Math.PI * 2); ctx.fill();
  } else if (isHurt) {
    // Lead arm knocked back, hanging loose
    drawArm(ctx, 13, -45, 10, -33, 8, -23, skinTone, skinShadow, skinHighlight);
  } else if (isRelieving) {
    drawReachingArm(ctx, 8, -42, 13, -32, 12, -21, skinTone);
  } else {
    // Walking / Standing / Ducking Aiming Pose
    // (hanging off a vine, however he's swung: the gun arm held level from the shoulder, aimed where the shots go)
    if (vine) { ctx.translate(VINE_SHOULDER.x, VINE_SHOULDER.y); ctx.rotate(-bodyRot); ctx.translate(-VINE_SHOULDER.x, -VINE_SHOULDER.y); }
    const armPump = isWalking ? walkStride * 8 : 0;
    const armBaseX = isDucking ? 10 : 8;
    const armBaseY = isDucking ? -26 : -42;
    // (leaning into a slope, the gun arm doesn't: it's held out level, right where it is on the flat)
    if (slopeLean) ctx.rotate(-slopeLean);
    // Just threw a boulder: the arm follows through from the shoulder (up and over for a lob, a low bowl otherwise)
    const throwing = (p.throwTimer || 0) > 0;
    if (throwing && pitchK < 0) {
      const t = 1 - p.throwTimer! / BOULDER_THROW_FRAMES;
      const ease = 1 - Math.pow(1 - t, 3);
      const [from, to] = p.throwLob ? [-2.3, -0.8] : [1.0, -0.35];
      ctx.translate(armBaseX, armBaseY); ctx.rotate(from + (to - from) * ease); ctx.translate(-armBaseX, -armBaseY);
    }

    const pump = armPump * 0.3;
    // The handgun's kick: the arm jolted back at the shoulder and the muzzle flipped up a touch, settling over a few frames
    // (only ever the handgun's own cooldown's worth: a longer one left over from something else, coming into a stage, had
    // the arm thrown off the screen and flying back into its socket)
    const kick = currentWeapon === 'GUN' && !throwing && p.shootCooldown <= GUN_COOLDOWN ? Math.min(1, Math.max(0, (p.shootCooldown - (GUN_COOLDOWN - GUN_KICK_FRAMES)) / GUN_KICK_FRAMES)) : 0;
    if (kick > 0) {
      const k = kick * kick;
      ctx.translate(armBaseX + 6, armBaseY - 3); ctx.rotate(-0.2 * k); ctx.translate(-(armBaseX + 6) - 3 * k, -(armBaseY - 3));
    }
    const shrugging = shrugK(p, state.frame);
    if (shrugging > 0) {
      // Shrugging, empty-handed: the elbow out from his side, the forearm up, the palm open and turned up (nothing in it)
      const s = shrugging;
      const ex = armBaseX + 4 + 6 * s, ey = armBaseY + 8 - 2 * s, hx = armBaseX + 11 + 8 * s, hy = armBaseY + 6 - 12 * s;
      drawArm(ctx, armBaseX + 6, armBaseY - 3 - 2 * s, ex, ey, hx, hy, skinTone, skinShadow, skinHighlight, hx + 3);
      ctx.fillStyle = skinTone; ctx.fillRect(hx - 1, hy - 2, 7, 3); ctx.fillStyle = skinShadow; ctx.fillRect(hx - 1, hy + 1, 7, 1); // (the open palm)
    } else if (pitchK >= 0) {
      // Pitching: the throwing arm, the rock in his fist till it's gone
      (p.throwKeg ? drawKegArm : drawPitchArm)(ctx, pitchK, armBaseX + 6, armBaseY - 3);
    } else if (vineArm) {
      // (on a vine, mid-move: the weapon's own way, what's in his fist and all)
      vineArm(ctx, animFrame, armBaseX + 6, armBaseY - 3, false);
    } else {
    // Shoulder at the edge of his chest, elbow down by his side (pumping a little as he walks), the fist out at the gun
    drawArm(ctx, armBaseX + 6, armBaseY - 3, armBaseX + 4 + pump * 0.4, armBaseY + 8, armBaseX + 11 + pump, armBaseY + 6, skinTone, skinShadow, skinHighlight, armBaseX + 15 + pump);
    // The fist round the grip: knuckles along the bottom
    ctx.fillStyle = skinShadow;
    for (let k = 0; k < 3; k++) ctx.fillRect(armBaseX + 13 + pump + k * 2, armBaseY + 8.5, 0.8, 2);
    drawLeadArmBlood(ctx, armBaseX, armBaseY, pump);
    }

    // Render Equipped Weapon in Meathead's lead hand!
    const wpnX = armBaseX + 10 + armPump * 0.3;
    const wpnY = armBaseY + 2;

    // (his hand's empty for a moment after a throw)
    if (hold) hold(ctx, wpnX, wpnY);
    // (out of boulders: nothing in his hand at all)
    else if (!vineArm && !isUnarmed && !throwing && !outOfRocks(p, currentWeapon) && shrugging <= 0) drawHeldWeapon(ctx, currentWeapon, wpnX, wpnY, p.flameAngle || 0, animFrame);
  }
  ctx.restore();

  // Back out of his local frame and stamp the outlined sprite into the world
  finishBody();

  // The stink coming up off him, and the flies he's picked up
  if (p.gut && p.gut.stage === 2 && !p.swimming) drawStink(ctx, p.pos.x + p.width / 2 - p.facing * 14, anchorY - 22, animFrame);

  // Pain sparks when knocked out of a special move
  if (hurtT >= 0 && hurtT < 0.5) {
    ctx.save();
    ctx.globalAlpha = 1 - hurtT * 2;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + hurtT * 3;
      const r = 18 + hurtT * 30;
      const sx = p.pos.x + p.width / 2 + Math.cos(a) * r;
      const sy = p.pos.y + 14 + drop + Math.sin(a) * r * 0.6;
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
      const sy = p.pos.y - 12 + drop + Math.sin(starAngle + s * 2.1) * 8;
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
/**
 * The ray gun, in his fist (the pistol's place): a chrome body like a fat bulb, the alien's pink coils glowing round
 * the barrel, a dish at the muzzle, fins; the grip wrapped in duct tape, a loose wire looping back into it.
 */
const drawRayGun = (ctx: CanvasRenderingContext2D, frame: number) => {
  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.2);
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(10, 2.5, 8.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#A1A1AA'; ctx.beginPath(); ctx.ellipse(10, 2.5, 7.5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E4E4E7'; ctx.beginPath(); ctx.ellipse(9, 1.2, 5, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#52525B'; ctx.fillRect(16, 1, 6, 3);
  for (const cx of [17, 19.5]) { ctx.fillStyle = `rgba(244, 114, 182, ${pulse.toFixed(2)})`; ctx.fillRect(cx, 0, 1.5, 5); }
  ctx.fillStyle = '#71717A'; ctx.fillRect(22, -1, 2, 7);
  ctx.fillStyle = '#F9A8D4'; ctx.fillRect(23.5, 1, 1, 3);
  ctx.fillStyle = '#3F3F46'; ctx.beginPath(); ctx.moveTo(4, -1); ctx.lineTo(8, -3); ctx.lineTo(9, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(4, 5, 4, 4);
  ctx.fillStyle = '#D4D4D8'; ctx.fillRect(4, 6, 4, 1); ctx.fillRect(4, 8, 4, 1);
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(14, 5); ctx.quadraticCurveTo(12, 10, 7, 8); ctx.stroke();
};

/** The weapon as he holds it, on its own: its grip at the origin, pointing +x (the walk screens draw it in his fist). */
export const drawHeldWeaponArt = (ctx: CanvasRenderingContext2D, weapon: WeaponType, frame: number) => drawHeldWeapon(ctx, weapon, 0, 0, 0, frame);

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
      // (Meathead 2: the ray gun he made out of the alien's leftovers)
      if (rayGun()) { drawRayGun(ctx, frame); glint(4, 14, 0, 2); break; }
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
    // (a game's own: combat/customWeapons.ts)
    default:
      customWeapon(weapon)?.drawHeld(ctx, frame);
  }
  ctx.restore();
};

/**
 * Slide tackle (crouch + charge): leaning way back, lead boot skimming the
 * floor steel-toe first, back leg tucked under, one palm planted behind.
 * Drawn in the player's local frame: (0,0) is between the feet, +x is forward.
 */
/**
 * A leg on a slope or stairs: from his hip at (hipX, -22) in his body (which is dropped, bobbed and leant by bodyY and
 * bodyRot: undone here, so the boot lands where the ground is) to the sole of the boot at (footX, soleY) along the
 * ground, its knee bent forward to make up the difference; a boot the hip can't reach is left reaching for it, the
 * leg straight. The boot sits at `angle` (along a slope; level on a stair's tread). The same trouser legs and boots
 * as he stands in on the flat (the near one with its pocket and, `grip`, the tread grips under it).
 */
/**
 * One leg of the walk on the flat, `phase` round its stride (0: the heel just down, out in front): planted while the
 * body goes over it, the heel peeling up and the toe pushing off at the back, then lifted, knee high, swung through
 * and reached out toe-up for the next heel strike.
 */
const WALK_REACH = 8, WALK_LIFT = 6.5;
const walkLeg = (ctx: CanvasRenderingContext2D, hipX: number, phase: number, bodyY: number, bodyRot: number, back: boolean) => {
  const u = ((phase / (Math.PI * 2)) % 1 + 1) % 1;
  let x: number, y: number, a: number;
  if (u < 0.55) {
    // Down: from out in front to behind him, flat; landing on the heel (toe up), rolling up onto the toe at the end
    const k = u / 0.55;
    x = WALK_REACH - k * WALK_REACH * 2;
    const peel = Math.max(0, (k - 0.7) / 0.3);
    // (lifted as far as the boot's tipped, so the toe or heel it's rocking on stays on the ground, not through it)
    const heel = Math.max(0, 1 - k / 0.12);
    a = heel * -0.28 + peel * 0.45;
    y = -peel * 4.5 - heel * 1.8;
  } else {
    // Up: snapped forward (quick off the ground, easing into the reach), the knee coming up high in the middle
    const k = (u - 0.55) / 0.45, e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    x = -WALK_REACH + e * WALK_REACH * 2;
    y = -Math.sin(Math.PI * Math.pow(k, 0.75)) * WALK_LIFT - 4.5 * Math.max(0, 1 - k / 0.25) - 1.8 * Math.max(0, (k - 0.8) / 0.2);
    a = Math.max(0, 1 - k * 2.2) * 0.35 - k * 0.3;
  }
  drawSlopeLeg(ctx, hipX, hipX + x, y, a, bodyY, bodyRot, back, false);
};

/** One leg backpedaling, `phase` round its step: planted (toe first, rolling back onto the heel) and carried back under
 *  him as he goes, then lifted (not high: careful) and reached back behind him for the next. */
const BACK_REACH = WALK_REACH * 0.7;
const walkBackLeg = (ctx: CanvasRenderingContext2D, hipX: number, phase: number, bodyY: number, bodyRot: number, back: boolean) => {
  const u = ((phase / (Math.PI * 2)) % 1 + 1) % 1;
  let x: number, y: number, a: number;
  if (u < 0.6) {
    // Down: from behind him to out in front (he's going back over it), the toe down first, then flat, then the toe up
    const k = u / 0.6;
    x = -BACK_REACH + k * BACK_REACH * 2;
    const toe = Math.max(0, 1 - k / 0.15), heel = Math.max(0, (k - 0.75) / 0.25);
    a = toe * 0.3 - heel * 0.35;
    y = -toe * 2 - heel * 3;
  } else {
    // Up: picked up off the heel and set back behind him
    const k = (u - 0.6) / 0.4, e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    x = BACK_REACH - e * BACK_REACH * 2;
    y = -Math.sin(Math.PI * k) * WALK_LIFT * 0.6 - 3;
    a = -0.2 + k * 0.45;
  }
  drawSlopeLeg(ctx, hipX, hipX + x, y, a, bodyY, bodyRot, back, false);
};

const drawSlopeLeg = (ctx: CanvasRenderingContext2D, hipX: number, footX: number, soleY: number, angle: number, bodyY: number, bodyRot: number, back: boolean, grip: boolean) => {
  const THIGH = 9, SHIN = 8, ANKLE = 5;
  // (the sole, in his body's frame)
  const c = Math.cos(bodyRot), sn = Math.sin(bodyRot), ly = soleY - bodyY;
  const fx = footX * c + ly * sn, fy = -footX * sn + ly * c;
  const hx = hipX, hy = -22;
  let dx = fx - hx, dy = fy - ANKLE - hy;
  const d = Math.hypot(dx, dy) || 1;
  dx /= d; dy /= d;
  const reach = Math.max(Math.abs(THIGH - SHIN) + 1, Math.min(THIGH + SHIN - 0.05, d));
  const ax = hx + dx * reach, ay = hy + dy * reach;
  // (the knee: forward of the line from the hip to the ankle)
  const along = (THIGH * THIGH - SHIN * SHIN + reach * reach) / (2 * reach), out = Math.sqrt(Math.max(0, THIGH * THIGH - along * along));
  const kx = hx + dx * along + dy * out, ky = hy + dy * along - dx * out;
  // (he doesn't skip leg day: thick thighs, tapering to the knee, calves filling the shins)
  const color = back ? pantsShadow : pantsColor, w = 10, tw = back ? 11.5 : 12.5;
  const seg = (x0: number, y0: number, x1: number, y1: number, len: number, width: number, pocket: boolean, singeAt?: number) => {
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2);
    drawPantLeg(ctx, -width / 2, 0, width, len, color, pocket, singeAt);
    ctx.restore();
  };
  seg(kx, ky, ax, ay, SHIN + 2, w, false, back ? undefined : 0.45);
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(kx, ky, w / 2, 0, Math.PI * 2); ctx.fill();
  seg(hx, hy, kx, ky, THIGH + 1, tw, !back);
  // (the boot: on the ground at the sole; one he's reaching down for the ground with, up on its toe)
  const toe = Math.min(0.7, Math.max(0, d - THIGH - SHIN) * 0.14);
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(angle - bodyRot + toe); ctx.translate(0, ANKLE);
  if (back) drawBoot(ctx, -6, -6, 12, 7, false);
  else drawBoot(ctx, -5, -6, 14, 7, true);
  if (grip) { ctx.fillStyle = '#09090B'; ctx.fillRect(-5, 1, 14, 2); }
  ctx.restore();
};

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

  // Back arm: reaching down behind him, the palm planted flat on the floor, fingers splayed, skidding along with him
  drawArm(ctx, -26, -33, -31, -18, -30, -5, skinShadow, backArmShade, skinTone);
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(-30, -2, 6, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = backArmShade; for (let k = 0; k < 3; k++) ctx.fillRect(-26 + k * 1.6, -2.6, 1.2, 2.4);

  // Back leg folded under him, the knee on the floor, the boot sole-up behind
  drawLeg(ctx, [-6, -12], [6, -4], [-12, -3], Math.PI, true);

  // Lead leg straight out along the floor, steel toe first
  drawLeg(ctx, [-4, -13], [12, -8], [26, -4], -0.05, false);

  // Sparks off the steel toe
  if (frame % 3 !== 0) {
    ctx.fillStyle = frame % 2 === 0 ? '#FDE047' : '#FB923C';
    for (let s = 0; s < 3; s++) ctx.fillRect(38 + ((frame * 5 + s * 7) % 12), -3 - ((frame + s * 3) % 6), 3, 2);
  }

  // Torso leaning way back from the hips: the same body as standing, laid back
  ctx.save();
  ctx.translate(-6, -13);
  ctx.rotate(-1.05);
  ctx.translate(0, 24);
  drawTorso(ctx, -50, 24, -48);
  drawBelt(ctx, -27, 7);
  ctx.restore();

  // Head up and forward over his chest, yelling
  drawHead(ctx, -26, -40, 'yell', frame);

  // Lead arm thrust forward over his chest, the gun leading the slide
  drawArm(ctx, -16, -33, -6, -32, 1, -36, skinTone, skinShadow, skinHighlight, 6);
  // (his actual weapon, where game/combat/muzzle.ts says shots come out mid-slide)
  if (!unarmed) drawHeldWeapon(ctx, weapon, SLIDE_HOLD.x, SLIDE_HOLD.y, 0, frame);

  ctx.restore();
};

/** The seat of his pants from `top` down `h`: soaked through brown, darkest at the seat, runs down the backs of both legs. */
const drawShitPants = (ctx: CanvasRenderingContext2D, top: number, h: number) => {
  if (snesShat()) { drawShitPantsSnes(ctx, top, h); return; }
  ctx.save();
  ctx.fillStyle = 'rgba(92, 58, 22, 0.75)';
  ctx.beginPath(); ctx.ellipse(-4, top + 5, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(70, 42, 14, 0.8)';
  ctx.beginPath(); ctx.ellipse(-7, top + 4, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
  // (it's run: streaks down the inside of each leg, a drip off the end of the longest)
  ctx.fillStyle = 'rgba(92, 58, 22, 0.7)';
  ctx.fillRect(-9, top + 8, 3, h * 0.55); ctx.fillRect(-2, top + 9, 2.5, h * 0.4); ctx.fillRect(4, top + 8, 2.5, h * 0.3);
  ctx.beginPath(); ctx.arc(-7.5, top + 8 + h * 0.55, 1.8, 0, Math.PI * 2); ctx.fill();
  // (a wet shine on it)
  ctx.fillStyle = 'rgba(200, 160, 100, 0.35)'; ctx.fillRect(-6, top + 2, 4, 1);
  ctx.restore();
};

/** (Meathead 2's) The same, at SNES grain: solid ramp steps on the denim (no see-through wash), a darker core where
 *  he sat in it, a lit lip along the top and a wet glint, and it's run: a streak down the back of each leg, the longer
 *  one beading at the end. Modest: a seat stain, not a coat of paint. */
const SHIT_RAMP = ['#3A220B', '#5C3A16', '#7A4E22', '#9A6A34', '#D4B07A'];
const drawShitPantsSnes = (ctx: CanvasRenderingContext2D, top: number, h: number) => {
  const t = Math.round(top), R = SHIT_RAMP;
  ctx.save();
  // (the stain: the soaked patch, ragged at its front edge where it's wicked up the denim)
  ctx.fillStyle = R[1];
  ctx.fillRect(-12, t + 2, 13, 6); ctx.fillRect(-11, t + 1, 10, 1); ctx.fillRect(-10, t + 8, 9, 1); ctx.fillRect(1, t + 3, 1, 3);
  // (the core, darkest: where he sat in it)
  ctx.fillStyle = R[0];
  ctx.fillRect(-10, t + 3, 6, 4); ctx.fillRect(-9, t + 7, 4, 1);
  // (the lit lip along the top, and a step of it down the front edge)
  ctx.fillStyle = R[2];
  ctx.fillRect(-11, t + 1, 8, 1); ctx.fillRect(-1, t + 2, 1, 4);
  ctx.fillStyle = R[3]; ctx.fillRect(-9, t + 1, 3, 1);
  // (a wet glint)
  ctx.fillStyle = R[4]; ctx.fillRect(-7, t + 2, 2, 1);
  // (it's run: down the back of each leg, a shade darker on the shadow side; the long one beads at the end)
  const l1 = Math.max(3, Math.round(h * 0.45)), l2 = Math.max(2, Math.round(h * 0.25));
  ctx.fillStyle = R[1]; ctx.fillRect(-10, t + 9, 2, l1); ctx.fillRect(-3, t + 9, 2, l2);
  ctx.fillStyle = R[0]; ctx.fillRect(-10, t + 9, 1, l1); ctx.fillRect(-3, t + 9, 1, l2);
  ctx.fillStyle = R[1]; ctx.fillRect(-11, t + 9 + l1, 3, 2);
  ctx.fillStyle = R[3]; ctx.fillRect(-10, t + 9 + l1, 1, 1);
  ctx.restore();
};

/** His jeans (the belt still through them) and his underpants (a brown stain in them), blown off him: tumbling through
 *  the air, then lying where they came down, fading after a while (world space). */
const drawBlowout = (ctx: CanvasRenderingContext2D, gut: NonNullable<Player['gut']>, frame: number) => {
  const SH = ['#5C3A16', '#7A4E22', '#4A2E10'];
  // Stains where it hit: splats on the floor, smears down walls, drips off ceilings
  for (const s of gut.stains ?? []) {
    ctx.fillStyle = SH[Math.floor(s.seed * 3)];
    if (s.side === 0) { ctx.beginPath(); ctx.ellipse(s.x, s.y - 0.5, s.r * 1.6, s.r * 0.45, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(s.x + s.r * 0.8, s.y - 1.5, 1.5, 1.5); }
    else if (s.side === 2) { ctx.beginPath(); ctx.ellipse(s.x, s.y + 0.5, s.r * 1.3, s.r * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(s.x - 0.75, s.y, 1.5, s.r + 2 + s.seed * 4); }
    else { ctx.beginPath(); ctx.ellipse(s.x + s.side * 0.5, s.y, s.r * 0.5, s.r * 1.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(s.x + s.side * 0.5 - 0.75, s.y, 1.5, s.r * 2 + s.seed * 8); }
  }
  // The heap, where he was: brown, steaming, torn bits of his jeans and a strip of his underpants in it
  if (gut.pile) {
    const { x, y, dir } = gut.pile;
    ctx.fillStyle = '#3A220B'; ctx.beginPath(); ctx.ellipse(x, y - 3, 13, 5, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 13, y - 3, 26, 3);
    ctx.fillStyle = '#5C3A16'; ctx.beginPath(); ctx.ellipse(x - 1, y - 4, 10, 4, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#7A4E22'; ctx.beginPath(); ctx.ellipse(x - 2, y - 7, 6, 3, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#1E3A8A'; ctx.save(); ctx.translate(x + dir * 6, y - 5); ctx.rotate(0.5); ctx.fillRect(-4, -1.5, 8, 3); ctx.restore();
    ctx.fillStyle = '#172554'; ctx.save(); ctx.translate(x - dir * 8, y - 3); ctx.rotate(-0.3); ctx.fillRect(-3, -1, 6, 2.5); ctx.restore();
    ctx.fillStyle = beltColor; ctx.save(); ctx.translate(x - dir * 2, y - 7); ctx.rotate(0.15); ctx.fillRect(-6, -1, 12, 2); ctx.fillStyle = beltBuckle; ctx.fillRect(-1.5, -1.5, 3, 3); ctx.restore();
    ctx.fillStyle = '#F4F4F5'; ctx.save(); ctx.translate(x + dir * 1, y - 8.5); ctx.rotate(-0.4); ctx.fillRect(-3, -1, 6, 2); ctx.restore();
    ctx.fillStyle = '#A16207'; ctx.fillRect(x - 3, y - 9, 2, 1);
    // (steam)
    for (let i = 0; i < 2; i++) { const k = ((frame * 0.02 + i * 0.5) % 1); ctx.strokeStyle = `rgba(140, 160, 70, ${(0.4 * (1 - k)).toFixed(2)})`; ctx.lineWidth = 1.2; ctx.beginPath(); const sx = x - 4 + i * 8, sy = y - 9 - k * 16; ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + 2, sy - 3, sx, sy - 6); ctx.stroke(); }
    // (fresh, the stink hangs over it a good while (here, not on him: it all came out of him), and two flies find it)
    const age = gut.pile.at !== undefined ? frame - gut.pile.at : Infinity;
    if (age >= 0 && age < 900) {
      ctx.save(); ctx.globalAlpha = age > 780 ? (900 - age) / 120 : 1;
      drawStink(ctx, x, y - 14, frame);
      ctx.restore();
    }
  }
  // Globs still flying
  for (const g of gut.globs ?? []) { ctx.fillStyle = '#5C3A16'; ctx.beginPath(); ctx.arc(g.x, g.y, 2.4, 0, Math.PI * 2); ctx.fill(); }
  // Shreds of his jeans, his torn underpants: tumbling, then lying where they came down
  for (const d of gut.debris ?? []) {
    ctx.save();
    ctx.globalAlpha = d.t > 1740 ? Math.max(0, (1800 - d.t) / 60) : 1;
    ctx.translate(d.x, d.y); ctx.rotate(d.a);
    if (d.kind === 'shred') {
      // (a torn strip of denim, ragged at the ends, a seam down it)
      ctx.fillStyle = '#0B1235'; ctx.fillRect(-d.w / 2 - 0.5, -2.5, d.w + 1, 5);
      ctx.fillStyle = pantsColorJeans; ctx.fillRect(-d.w / 2, -2, d.w, 4);
      ctx.fillStyle = '#172554'; ctx.fillRect(-d.w / 2, 0.5, d.w, 1.5);
      ctx.fillStyle = '#D97706'; ctx.fillRect(-d.w / 2 + 1, -1, d.w - 2, 0.5);
      ctx.fillStyle = '#93C5FD'; ctx.fillRect(d.w / 2 - 1, -2.5, 1, 1); ctx.fillRect(-d.w / 2, 1.5, 1, 1);
    } else {
      ctx.fillStyle = '#3F3F46'; ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(8, -5); ctx.lineTo(4, 5); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#F4F4F5'; ctx.beginPath(); ctx.moveTo(-7, -4); ctx.lineTo(7, -4); ctx.lineTo(3.5, 4); ctx.lineTo(-3.5, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(-7, -4, 14, 1.4);
      ctx.fillStyle = 'rgba(110, 66, 24, 0.85)'; ctx.beginPath(); ctx.ellipse(0, 1.5, 3, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      // (torn: one leg hole ripped open, a loose flap of it)
      ctx.fillStyle = '#A1A1AA'; ctx.beginPath(); ctx.moveTo(3.5, 4); ctx.lineTo(7, 6); ctx.lineTo(5, 3); ctx.lineTo(8, 2.5); ctx.lineTo(4.5, 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#F4F4F5'; ctx.beginPath(); ctx.moveTo(4, 3.5); ctx.lineTo(6.2, 5); ctx.lineTo(4.8, 2.6); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
};
const pantsColorJeans = '#1E3A8A';

/** Wavy green stink lines rising off him, and two flies looping round his backside (world space). */
const drawStink = (ctx: CanvasRenderingContext2D, x: number, y: number, f: number) => {
  ctx.save();
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const t = ((f * 0.6 + i * 26) % 80) / 80;
    ctx.strokeStyle = `rgba(150, 175, 70, ${(0.7 * (1 - t)).toFixed(2)})`;
    const bx = x + (i - 1) * 6, by = y - t * 26;
    ctx.beginPath();
    for (let k = 0; k <= 7; k++) { const yy = by - k * 2.2, xx = bx + Math.sin(k * 0.9 + f * 0.15 + i) * 3; if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
    ctx.stroke();
  }
  ctx.fillStyle = '#111827';
  for (let i = 0; i < 2; i++) {
    const a = f * (0.16 + i * 0.05) + i * 2.5;
    const fx = x + Math.cos(a) * (16 + i * 5), fy = y + 8 + Math.sin(a * 1.7) * 9;
    ctx.fillRect(fx - 1, fy - 1, 2.5, 2.5);
    if (f % 4 < 2) { ctx.fillStyle = 'rgba(226, 232, 240, 0.7)'; ctx.fillRect(fx - 2, fy - 3, 2, 1.5); ctx.fillRect(fx + 1, fy - 3, 2, 1.5); ctx.fillStyle = '#111827'; }
  }
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

/** Out of boulders: his throwing hand's empty. */
const outOfRocks = (p: Player, weapon: WeaponType) => weapon === 'BOULDER' && (p.weaponAmmo?.BOULDER ?? 1) < 1;
/** How far into a shrug he is (0..1): up quick, held a beat, down. */
const SHRUG_FRAMES = 40;
const shrugK = (p: Player, frame: number) => {
  if (p.shrugAt === undefined) return 0;
  const t = frame - p.shrugAt;
  if (t < 0 || t >= SHRUG_FRAMES) return 0;
  const k = Math.min(1, t / 6, (SHRUG_FRAMES - t) / 10);
  return k * k * (3 - 2 * k);
};

/** A space suit's fishbowl helmet over his head (Player.spaceSuit), its middle by his eyes (x, y), tilted with his head
 *  (`angle`): the glass (a tint, a band of glare across it, a glint), the chrome collar ring at his neck. World space. */
const drawSpaceHelmet = (c: CanvasRenderingContext2D, x: number, y: number, angle: number, facing: number) => {
  c.save(); c.translate(x, y); c.rotate(angle); c.scale(facing < 0 ? -1 : 1, 1);
  const cx = -2, cy = -3, r = 17;
  // (the collar: a chrome ring round his neck, banded, inked)
  c.fillStyle = '#1A0B06'; c.fillRect(cx - 14, cy + 13, 28, 8);
  c.fillStyle = '#94A3B8'; c.fillRect(cx - 13, cy + 14, 26, 6);
  c.fillStyle = '#E2E8F0'; c.fillRect(cx - 13, cy + 14, 26, 2);
  c.fillStyle = '#475569'; c.fillRect(cx - 13, cy + 19, 26, 1);
  // (the glass: a faint blue over his head, darker round its rim)
  c.fillStyle = 'rgba(186, 230, 253, 0.16)'; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(14, 116, 144, 0.55)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r - 1, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#1A0B06'; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  // (the glare: a band of light round its upper front, and a glint)
  c.strokeStyle = 'rgba(255, 255, 255, 0.55)'; c.lineWidth = 2.5; c.beginPath(); c.arc(cx, cy, r - 4, -2.5, -1.5); c.stroke();
  c.fillStyle = 'rgba(255, 255, 255, 0.9)'; c.fillRect(cx + 7, cy - 11, 3, 3);
  c.fillStyle = 'rgba(255, 255, 255, 0.35)'; c.fillRect(cx - 12, cy + 4, 2, 5);
  c.restore();
};
