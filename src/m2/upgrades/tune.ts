// The hidden upgrades' feel numbers, all in one place (SPEC.md's TUNE marks): starting points, to be adjusted in play.

// ---- each charge-move piece: its move goes somewhat further (SPEC: "about +25% distance/height")
/** Pauldrons: the shoulder charge's longest hold (its distance), times. */
export const PAULDRONS_REACH = 1.25;
/** Leg armor: the slide's length, times. */
export const LEGS_REACH = 1.25;
/** Armguards: the uppercut's rise (its height), times. */
export const ARMGUARDS_REACH = 1.25;
/** Sabatons: the dive kick's reach across (same speed down, a shallower line), times. */
export const SABATONS_REACH = 1.25;

// ---- leg armor
/** A slide that trips a regular enemy: how long it's down (frames; the engine's plain daze off a hit is 40). */
export const LEGS_TRIP_FRAMES = 80;

// ---- helmet
/** Everything that hurts him (bar instant kills), times. On top of Meathead 2's own soft hits (×0.65). */
export const HELMET_HURT = 0.75;
/** His head, for shots the helmet stops: standing, the top this many px of his box (64 tall), and this much above it. */
export const HELMET_HEAD_H = 20, HELMET_HEAD_ABOVE = 8;
/** Ducking, the head's lower and the stopped area bigger: the top this many px of his crouched box (36 tall). */
export const HELMET_DUCK_HEAD_H = 26;
/** A shot this big either way (or bigger) is too big for a helmet to stop (a car, a barrel): it hurts as ever. */
export const HELMET_MAX_SHOT = 30;

// ---- cape
/** His walking speed, times (multiplies with the spellbook's bulk up, 1.6: bulked with the cape ≈ 1.8). */
export const CAPE_WALK = 1.12;
/** A held jump's rising frames, times: 15 → 18, about +15% height (145 px → 166). */
export const CAPE_JUMP_HOLD = 1.2;
/** The float: the fastest he falls holding jump (px a frame; plain falling tops out at 20). */
export const CAPE_FLOAT_FALL = 2.2;
