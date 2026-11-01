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
/** His walking speed, times (multiplies with the spellbook's bulk up, 1.6: bulked with the cape ≈ 1.9; under the bulk up on its own). */
export const CAPE_WALK = 1.2;
/** A held jump's rising frames, times: 15 → 20, about +25% height. */
export const CAPE_JUMP_HOLD = 1.33;
/** The float: the fastest he falls holding jump (px a frame; plain falling tops out at 20). */
export const CAPE_FLOAT_FALL = 2.2;

// ---- amulet: the piss-off yell (amulet.ts)
/** Damage he takes to fill the meter: what actually comes off his health, after every cut (Meathead 2's soft hits
 *  ×0.65, the helmet's ×0.75). SPEC's "full at ~35 damage". */
export const AMULET_FULL = 35;
/** On top, every hit he takes adds this much, however little it took (the owner: "getting hit in general is weighed
 *  more ... big hits still fill it up faster"): a small hit (~3) fills under a third of it, a big one (~15) about 60%. (Was 9; the owner: "just slightly reduce
 *  how quickly it currently fills up".) */
export const AMULET_HIT = 7;
/** ...and the harder it knocks him back, the more again: his speed off it (px a frame) times this, up to the most.
 *  A plain bump (7 across, 4 up, ≈8) adds ≈6.5 (two bumps nearly fill it, three do); a goat's butt ≈12; a big launch
 *  near enough fills it alone. (Was 1 / 26.) */
export const AMULET_KNOCK_K = 0.8, AMULET_KNOCK_MAX = 22;
/** Only enemies' attacks fill it: a trap's hurt (or a burn's tick) adds nothing, but holds it from draining this long
 *  (frames; the owner: "traps don't fill up the piss off meter but can freeze it from any decay"). */
export const AMULET_TRAP_HOLD = 180;
/** How fast it drains on its own (damage's worth a frame): 2.8 a second, full to empty in 12.5 s (was SPEC's 3.5, 10 s;
 *  the owner: "slightly reduce the rate of decay"). */
export const AMULET_DRAIN = 2.8 / 60;
/** What the yell does to everything on the screen (regular enemies, sub-bosses, bosses: each fight's breather as ever). */
export const YELL_DAMAGE = 15;
/** How long a regular enemy it doesn't kill is stunned (frames). */
export const YELL_STUN = 90;
/** After it: invulnerable this long, nothing knocking him about, his charge moves and grabs harder (frames; was SPEC's
 *  3 s, the owner: "give the player about 2 more seconds of 'fuck off' hyper mode"). */
export const YELL_SHIELD = 300;
/** Then this long before the meter can fill again (frames; was SPEC's 10 s, the owner: "reduce the length of time you
 *  need to wait before another 'fuck off' can happen a bit"). */
export const YELL_COOLDOWN = 420;
/** Through the rage (the YELL_SHIELD stretch), his charge moves and his grabs hit this many times harder: the four moves,
 *  the flash kick, the follow-ups, every grab's slam, throw and beatdown blow; regular enemies, sub-bosses and bosses
 *  (each fight's breather as ever: the amount, not the rate). Not his weapons. Under the bulk up's own (its knock ×2.2,
 *  its beatdown blows ×2.5), and the two multiply: bulked and raging, a beatdown blow's 2.5 × 1.5 = 3.75. */
export const RAGE_DAMAGE_K = 1.5;
/** Past the screen's edges, still "on screen" for the yell (px). */
export const YELL_EDGE = 24;
/** The meter this full (a share) and his face on the sprite goes angry. */
export const AMULET_ANGRY_AT = 0.4;

// ---- the follow-ups (moves/followups.ts; SPEC "Follow-ups, generally" and each piece's)
/** No hit needed (the owner's "not require a hit confirmation but rather just within a quick window of doing the
 *  charge->grab"): Y + B any time in the move (dive kick, charge, uppercut) or this many frames after it ends. */
export const FOLLOW_WINDOW = 24;
/** How far off one can be and still get taken ("give the new 'special grabs' a wide berth, wider than what appears"):
 *  across, from his middle to their near edge (the charge's wider), up/down the same way. Was 130 / 190 / 170 to their
 *  middle, after a hit. */
export const FOLLOW_REACH = 200, FOLLOW_REACH_CHARGE = 260, FOLLOW_REACH_UP = 200;
/** Sabatons' missile: how fast he's hurled (px a frame; the shakedown's throw is 17), and what he does to whoever he
 *  hits, times a thrown body's own (mass × speed; its cap of 160 times it too). */
export const MISSILE_SPEED = 25, MISSILE_HIT_K = 1.6;
/** ...and how long it flies dead level at that speed before it drops like any throw (frames; 20 ≈ 500 px). It used to
 *  drop straight away, landing a body length or two off (the owner: "doesn't seem to launch foes very far"). */
export const MISSILE_CRUISE = 20;
/** Pauldrons: a head kicked off out of the ground: its speed across, what it does to whoever it hits. */
export const HEAD_KICK_SPEED = 13, HEAD_HIT = 70;
/** How near the head he has to be for B to kick it (px from his middle), and how many stuck in the ground at once. */
export const HEAD_KICK_REACH = 64, BURIED_MAX = 12;
/** A head in the ground isn't dead (the owner's "the top spin should no longer kill an enemy buried in the ground but
 *  give them many seconds to dig themselves out. they are otherwise harmless and the 'football' kick will eliminate
 *  them"): this long in it (frames), the last BURIED_DIG of them digging (shaking, the dirt flying, coming up), then
 *  out and back at it. */
export const BURIED_FREE = 600, BURIED_DIG = 120;
/** Armguards' ninja drop: how hard they come down (px a frame at the most) and what it does: most regular enemies dead,
 *  the tankiest live through it (the owner: "the ninja drop can be non-fatal to some tankier enemies"). Was 999. */
export const NINJA_FALL = 22, NINJA_DAMAGE = 200;
/** ...and where they land, a meteor going off (the owner's "a localized 'meteor' impact too": the spellbook meteor's
 *  look): everybody else in this circle (px from the landing; regular enemies only) takes up to this much, by how near,
 *  the ones it doesn't kill knocked away and stunned this long (frames). */
export const NINJA_METEOR_R = 110, NINJA_METEOR_DMG = 60, NINJA_METEOR_STUN = 60;
/** Leg armor's flash kick: its rise, a share of the uppercut's (SPEC: "about half"), the circle it hits in (px from his
 *  middle), what it does to a regular enemy (the uppercut's 150; bosses: the armored share through bossMelee). */
export const FLASH_RISE = 0.5, FLASH_RADIUS = 100, FLASH_DAMAGE = 150;
// ---- hand armor
/** Every beatdown blow heals this many times more with the hand armor. */
export const HANDS_HEAL = 1.6;
/** The cheap shot (cheapShot.ts): how long the boss is stunned after it (frames; SPEC's 5 s: four 75-frame breathers). */
export const CHEAP_STUN = 300;
/** How near he has to be: across, from his middle to their near side (px); up/down, how far their boxes can miss. */
export const CHEAP_REACH = 60, CHEAP_REACH_UP = 10;
