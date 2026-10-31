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

// ---- amulet: the piss-off yell (amulet.ts)
/** Damage he takes to fill the meter: what actually comes off his health, after every cut (Meathead 2's soft hits
 *  ×0.65, the helmet's ×0.75). SPEC's "full at ~35 damage". */
export const AMULET_FULL = 35;
/** How fast it drains on its own (damage's worth a frame): SPEC's ~3.5 a second (full to empty in 10 s). */
export const AMULET_DRAIN = 3.5 / 60;
/** What the yell does to everything on the screen (regular enemies, sub-bosses, bosses: each fight's breather as ever). */
export const YELL_DAMAGE = 15;
/** How long a regular enemy it doesn't kill is stunned (frames). */
export const YELL_STUN = 90;
/** After it: invulnerable this long, nothing knocking him about (frames; SPEC's ~3 s). */
export const YELL_SHIELD = 180;
/** Then this long before the meter can fill again (frames; SPEC's ~10 s). */
export const YELL_COOLDOWN = 600;
/** Past the screen's edges, still "on screen" for the yell (px). */
export const YELL_EDGE = 24;
/** The meter this full (a share) and his face on the sprite goes angry. */
export const AMULET_ANGRY_AT = 0.4;

// ---- the follow-ups (moves/followups.ts; SPEC "Follow-ups, generally" and each piece's)
/** How long after a non-fatal hit (dive kick, charge, uppercut) Y + B still makes the follow-up (frames). */
export const FOLLOW_WINDOW = 30;
/** How far off he can be from the one he hit and still get to it: across (a charge's push sends them further), up/down. */
export const FOLLOW_REACH = 130, FOLLOW_REACH_CHARGE = 190, FOLLOW_REACH_UP = 170;
/** Health back for a follow-up (the air grab's 12; times the enemy's healK, nothing off noHeal). */
export const FOLLOW_HEAL = 12;
/** Sabatons' missile: how fast he's hurled (px a frame; the shakedown's throw is 17), and what he does to whoever he
 *  hits, times a thrown body's own (mass × speed; its cap of 160 times it too). */
export const MISSILE_SPEED = 25, MISSILE_HIT_K = 1.6;
/** Pauldrons: a head kicked off out of the ground: its speed across, what it does to whoever it hits. */
export const HEAD_KICK_SPEED = 13, HEAD_HIT = 70;
/** How near the head he has to be for B to kick it (px from his middle), and how many stuck in the ground at once. */
export const HEAD_KICK_REACH = 64, BURIED_MAX = 12;
/** Armguards' ninja drop: how hard they come down (px a frame at the most) and what it does (regular enemies: dead). */
export const NINJA_FALL = 22, NINJA_DAMAGE = 999;
/** Leg armor's flash kick: its rise, a share of the uppercut's (SPEC: "about half"), the circle it hits in (px from his
 *  middle), what it does to a regular enemy (the uppercut's 150; bosses: the armored share through bossMelee). */
export const FLASH_RISE = 0.5, FLASH_RADIUS = 100, FLASH_DAMAGE = 150;
// ---- hand armor
/** Every beatdown blow heals this many times more with the hand armor. */
export const HANDS_HEAL = 1.6;
