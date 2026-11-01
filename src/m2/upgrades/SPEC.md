# Meathead 2: the hidden upgrades (the owner's design, 2026-10-31)

The owner planned this in plain words; this is the settled version. Quotes are the owner's. Anything marked TUNE is a
starting number to be adjusted by feel in play.

## The finds: 24, three hidden in every land

| Find | Count | Effect |
|---|---|---|
| Max health | 5 | +10% max health each (100 → 150 with all 5) |
| Max ammo | 5 | +10% ammo capacity each (+50% with all 5), every weapon |
| Charge shards | 6 | every 3 make a new power cell: 2 cells → 3 → 4 |
| Armor | 8 | one piece per land, each a big buff to an existing move (below) |

- Permanent: saved with the save file (src/m2/save.ts, src/m2/store.ts), across lands and deaths.
- Where they're hidden, and which land gives which armor piece: NOT DECIDED. Don't place anything in the levels yet.
- THE TEST TOOL: in the cheats build's CHEATS panel (src/m2/cheats.ts and its panel), a toggle per armor piece and
  steppers for the health / ammo / shard counts. ("i just want a debug menu that lets me equip each piece from the
  cheat menu so i can test it out.") The cheat panel is dev-only, mouse-only access is fine.

## Global balance changes that come with it

- THE DIVE KICK IS FREE, in general, upgrades or not: no power cost, and stomps refund nothing ("just remove the dive
  kick refunding. it's just generally free to use"). Meathead 2 only (M1 shares the engine: gate it).
- CHARGE MOVES ON BOSSES: all four (charge, slide, uppercut, dive kick) are normalized: each counts as 150 against a
  boss, times the non-weakness share: 25% on a land boss (37.5), 35% on a sub-boss (52.5). With that move's armor
  piece the share doubles: 50% (75) / 70% (105). Regular enemies keep their damage tables (ENEMY_CHARGE 20, SLIDE 20,
  UPPERCUT 150, DIVEKICK 150) UNCHANGED, piece or not ("upgraded charge moves should only do extra damage to bosses",
  2026-10-31). ("normalize charge and slide damage to
  bosses... for regular enemies, those damage tables are fine.") Each land boss's fight.ts computes melee damage
  itself (BOSS_CHARGE_DAMAGE / BOSS_UPPERCUT_DAMAGE): change it there, per fight, via one shared helper.
- An armor piece's extra damage is FOR BOSSES ONLY (land bosses and sub-bosses: the doubled share above). Regular
  enemies take the same as without it. (Replaces the earlier "flat +50% overall".)
- EACH CHARGE-MOVE PIECE ALSO MAKES ITS MOVE GO SOMEWHAT FURTHER (sabatons: the dive kick; pauldrons: the charge; leg
  armor: the slide; armguards: the uppercut). TUNE: about +25% distance/height.
- "All new moves have utility in all situations."

## The 8 armor pieces

Look: each piece is themed on the land it came from, so fully equipped he's "a mismatched clusterfuck, like an MMO
character who doesn't transmog". His CHEST STAYS BARE, and MOST OF HIS JEANS SHOW (his shitty seat, or naked his ass
and dick, still show): the leg armor is knee/shin pieces, nothing over his crotch or seat. His thick glasses show with
the helmet on. Every piece shows wherever he's drawn, and matches: the in-game sprite (every pose), the walk-ins
(walkAway/meatheadBack.ts), the walk-aways (front), the hub portal, grabs, deaths, cutscenes, the weapon-get screen.
Build each piece as its own part every drawing path can turn on.

VISIBILITY RULES (2026-10-31: "make sure the front and back of his jeans can always be seen, that way the shitty pants
and the nude gags are not obstructed. same for the glasses ... the astronaut suit doesn't conflict ... you should be able
to see everything"; then "every piece should be visible"). With all 8 on, in every pose and draw path:
- JEANS FRONT AND BACK: nothing covers his crotch, seat or most of the jeans, in all three pants states (clean, the
  shitty stain, naked: ass and dick). The cape never reaches below his belt in any mode (hanging, fluttering, streaming
  as he falls, spread while floating): its points are shortened to the belt line and it's clipped there too
  (armorArt.ts cape, `hem`); from behind on the walk screens it's split down his spine and stops above the belt. The leg
  armor is knee and shin only (no higher than just above the knee). The amulet's chain stays on his chest.
  The gloves stay on his fists: a hanging hand rests beside the hip, never over the fly or the seat.
- NO PIECE ON TOP OF ANOTHER (2026-10-31: "i'd like the leg guards and the arm guards to be a bit bigger and
  unobstructed by the hand feet upgrades ... i want to be able to see 'beef' on the arm guards completely during the walk
  in without being obstructed by the gloves ... no two parts to sit too much on top of each other"; "the main models
  should line up too"). Small clean gaps between pieces, the same on the sprite and the walk figures:
  - ARMGUARDS cover the forearm from a little above the elbow (well under the pauldron's trim) to just short of the
    wrist. The GLOVE starts past the wrist (its cuff's back edge: armorArt.ts GLOVE_AT / GLOVE_BACK), never over it.
  - On the walk figures the whole word BEEF is lit, upright, on a panel in the bracer's middle (drawLedWord); on the
    sprite it scrolls through the bracer's slot with square LEDs (drawLed), as much as fits.
  - LEG GUARDS: the film-reel knee pad over the knee and the taped statuette from just above the knee down the whole
    shin, the leg's full width, stopping a clean gap above the boot. The SABATONS keep inside the boot's own rect (no
    shaft up the shin), the cowbell hangs on the boot.
- GLASSES: the helmet's brim stops above the glasses (sprite: ey - 4.6, the rims start at ey - 3.3), and the glasses
  are drawn after the helmet in every path (sprite, walk figures, HUD face). Nothing else goes over his eyes.
- THE ASTRONAUT LOOK (Future Land's Space Needle 2, Player.spaceSuit): not a uniform, just the glass fishbowl and a
  whitened body. The white is laid on AS HE'S DRAWN (spriteOutline.ts setSpriteTint / armorSeam), so every armor piece
  keeps its own colors over the white. The Viking helmet sits INSIDE the glass: shrunk to 0.72 about its brim (the brim
  stays above his glasses) and clipped inside the glass, the horn tips jammed against it (armorArt.ts DOME_FIT /
  DOME_IN); his face and glasses show through the glass. The grab and pose sprites (grab.ts sprite) do the same,
  fishbowl included.

Provisional land themes (the owner hasn't assigned lands yet; use these until told): Jungle: khaki, bamboo, leopard,
tusks; Spooky: bat wings, coffin wood, plastic skulls; Future: chrome XENOSCARE resin, neon; Hollywood: gold statuette
plating, film reels, a stunt pad; Foreign: flag patches, a Viking horn; Wilderness: rusted railroad iron, a cowbell;
Fairy: pink sequins, glitter crystal, tiara spikes; Cartoon: flat, outlined, a big white glove.

PROVISIONAL THEME PER PIECE (Phase E, 2026-10-31; change freely once the owner assigns lands):
| Piece | Land | Look |
|---|---|---|
| SABATONS | Wilderness | cowboy boots of rusty railroad iron: pointed iron toe, stacked heel, rivets, a spur, a cowbell on the near ankle that clanks on landings and dive kicks (visual only, no sound) |
| PAULDRONS | Jungle | two coconut halves strapped on (hairy shell, white meat round the rim), leopard-print trim, a plastic tusk glued on |
| LEG ARMOR | Hollywood | gold award statuettes duct-taped down his shins (silver tape), film reels for knee pads |
| ARMGUARDS | Future | chrome bracers with a red LED strip scrolling BEEF |
| HAND ARMOR | Cartoon | giant white four-finger cartoon gloves: outlined, three stitches, a rolled cuff |
| HELMET | Foreign | a souvenir-shop Viking helmet: plastic horns, a flag patch, a beer can in a holder each side, a bendy straw to his mouth that goes round his glasses, never across them |
| AMULET | Fairy | a pink plastic princess-kit heart jewel in a gold plastic setting, on a sequin chain |
| CAPE | Spooky | a cheap Halloween-store vampire cape: shiny black polyester still creased in squares from the package, red lining, a tall collar, the price tag flapping; short (stops above the belt) |

ART PASS (2026-10-31: "do another art pass on those accessories and make them funny and distinct"; "meathead should
look like a mismatched fool when fully decked out"): the versions above. Fully decked out he's a joke on purpose:
clashing colors and materials side by side (rust, coconut brown, gold and grey tape, chrome and red LEDs, cartoon white,
silver and yellow souvenir plastic with red and blue cans, pink plastic, cheap black polyester), sizes a little off (the
gloves too big, the helmet a touch crooked), nothing coordinated. DON'T harmonize the palette across pieces. Each still
reads at sprite size, and the jeans and glasses rules above still hold. The LED text, the bell's swing and the price tag
are baked strips only slid or turned per frame; the straw is one stroke.

AS BUILT (Phase E, the art): upgrades/armorArt.ts (its header has the lot). Meathead 1's body parts (m1
render/player/body.ts: drawBoot, drawLeg / drawJointedLeg, drawArm, drawRamDelt, drawGlasses, drawTorso) call an
ArmorArt hook (setArmorArt; Meathead 1 never sets it, the cat form never wears it), so every pose built from them wears
the pieces: the sprite in every pose, the charge / uppercut / dive kick / slide, the grabs, the follow-ups (figure()), the
boss deaths that draw him with those parts. player.ts calls the same hook on its own hand-drawn limbs and legs, and
feeds the cape his motion (setArmorMotion: speed, falling, Player.floating). The rigid pieces are baked once (unit
pixels, ramps, banded with a checker on each edge) and drawn stretched and turned; the cape is a few banded paths a
frame. Nothing caches his sprite, so no cache key needed the pieces. Also: the walk screens (upgrades/walkArmor.ts, in
walkAway/meathead.ts from the front and meatheadBack.ts from behind: the walk-aways, the walk-ins, the hub portal;
from behind the cape's split down his spine and stops above his belt), the HUD face's helmet (amuletFace.ts
helmetFace), the cheap shot's close-up boot (drawSabatonCloseUp).
THE SPECIAL DRAWINGS (2026-10-31: "do you account for the 'beatdown' closeups for the fairy wheel as well, based on
what combination of armor pieces you may have?"): every bespoke drawing of him after he can own armor wears whatever
he owns, live. The kit: armorArt.ts armorParts (the side-view pieces from limb positions, any size, finer bakes for
bigger drawings made lazily per size) and withArmor (an ink line for inked art, the straw's path for a face of the
drawing's own, the cape's motion and clock); walkArmor.ts FLAT (the front and back pieces from anchors, any size);
body.ts ArmorArt.flat for Meathead 1's poses. Covered: the Fairy Wheel close-ups (closeup.ts: the tussle, the five
kills, thrown out; kills.ts draws him with body.ts's parts), the broomstick ride and fall (broom/art.ts, broomPose.ts),
the Road Rash dirt bike (dirtbike/art.ts), the ladder climb from behind, remains, deaths, throne, copter, tragon, seat
punch and paddle poses (m1 render/player/), the Queen's severed head (queen/basement.ts), the guard kick close-up
(amphi/guard.ts), the mallet tornado's glimpses (weapons/mallet.ts), the Pisa finger (heli/pisaDeath.ts), the cheap
shot's leg (closeUp.ts). The hub portal and the launch draw his sprite. Left: the mallet tornado's torso smear (a
blur); the bike's cached frames hold the LEDs, cape and bell still. Never: the title, the intro and gym, Meathead 1's
weapon-get and face-off screens, the cat.

AS BUILT (the armored moves' look, 2026-10-31: "make sure the visual flourishes of an upgraded charge attack are fancier
colors too"): with a move's piece, its flourishes (speed lines, afterimages, glow, sparks, rings, dust, the dive kick's
fire, the hit bursts) take the piece's land colors: the charge leopard gold and jungle green, the slide statuette gold
and glitter, the uppercut chrome with neon cyan and magenta, the dive kick's fire molten iron to cowbell brass,
white-hot. Meathead 1's moves ask a hook (m1 render/player/moveFlair.ts, set in upgrades/gear.ts FLAIR); M1 never sets
it. Colors only, no per-frame pixel work.

### SABATONS (feet): the dive kick
- More damage on bosses; the dive kick goes further. Ignores spikes: the spiky enemies that punish a dive kick (KindDef.spiky) and spike hazards.
- FOLLOW-UP: Y+B (the beatdown chord; R on the keyboard) in or shortly after a dive kick (no hit needed since
  2026-10-31: see "Follow-ups, generally"): he flips
  upside down, grabs the enemy by the shoulders, flips around (swinging them up and over) and hurls them straight
  ahead at high speed: the enemy is a MISSILE into whatever's ahead. Weight counts (melee collateral: mass × speed),
  more potent than the shakedown's throw. Works on enemies in the air too; gravity arcs the throw down. No steering.
- AS BUILT (Phase D1, 2026-10-31: moves/followups.ts): flipped over onto them (8 frames), swung round (12), let go
  straight ahead at MISSILE_SPEED 25 (the throw's 17), a body thrown with its collateral ×MISSILE_HIT_K 1.6 (cap 256);
  `dropping`, so a flyer falls too. Nothing hurts him through it (like the air grab). No heal (follow-ups never heal: 2026-10-31).

### PAULDRONS (shoulders): the shoulder charge
- More damage on bosses; the charge goes further. Ignores what punishes a charge: horned beasts, spear enemies (KindDef.pointy).
- FOLLOW-UP: Y+B in or just after a charge (no hit needed): he steps up to them, raises both fists overhead and BONKS
  them on the top of the head, driving them INTO THE GROUND LIKE A RAIL SPIKE (the owner, 2026-10-31; it used to be a
  spin), just their head out: harmless, digging out after BURIED_FREE. Only on an enemy standing on the ground (the
  charge itself works in the air; the follow-up doesn't take a flyer or one in the air). The charge pushes them back,
  so the follow-up's reach is wide.
- THE HEAD KICK: B near a head sticking out of the ground: he kicks the head off like a football, a projectile into
  other enemies. If his side would kick it at nobody, he walks round to the other side and points at the enemies
  first, then kicks.
- AS BUILT (Phase D1): the reach is FOLLOW_REACH_CHARGE 190 px; he steps in, lifts, and drills them down to the neck
  (their kind's head height); the head's out of the enemy list (it counts as gone), looks at him, and stays for the
  stage (12 at most). B on its own within HEAD_KICK_REACH 64 of one (a B button prompt hangs over the head whenever he
  can kick it: the owner's "show a B button prompt show on screen when ready for a field goal kick"; WorldPrompt.tsx): the kick, aimed in an arc at the nearest enemy that
  way (HEAD_HIT 70 to whoever it hits, a bounce off them); the stump spurts and goes after 6 s. The head itself is
  baked once out of their picture and drawn turned. Callouts PLANTED / FIELD GOAL.

### LEG ARMOR (knees and shins): the slide tackle
- More damage on bosses; the slide goes further. Ignores damage from the front while sliding.
- A non-fatal slide TRIPS / STUNS any enemy and DOESN'T STOP HIM (no bounce-off; he slides on through). Bosses can't
  be tripped (they just take the damage). NO follow-up grab: it's a keep-away tool.
- THE FLASH KICK (2026-10-31: "pressing up+b during a slide tackle will do a [Guile] like flip kick"): not a hit-confirm
  like the other follow-ups: Up+B at any point DURING a slide (the leg armor's longer slide gives room for it) launches
  Guile's flash kick, a backflip with the leg sweeping up in an arc. FREE: no power cell (the owner, 2026-10-31: "make the flash kick not require a meter"; it used to cost one).
  It rises LESS than the uppercut ("flash kick doesn't get as much vertical thrust as an uppercut"): a short hop up,
  TUNE about half the uppercut's height; the reach is the circle, not the height.
  - It connects: a BIG CIRCULAR AOE around him, HEAVY damage (TUNE: 150 on regular enemies, like the uppercut; on
    bosses/sub-bosses the armored share, 75 / 105, through bossMelee).
  - Anyone it kills is SLICED IN HALF VERTICALLY, down the forehead, the two halves falling apart, gore. Regular enemies
    and sub-bosses' minions; bosses die their fight's own way (no new boss deaths). Critters too.
  - Works on grab-immune enemies (it's not a grab).
- POWER RULE (general, with the flash kick): power cells DON'T RECHARGE while a charge move (charge, slide, uppercut,
  dive kick, and the flash kick) is under way ("energy doesn't recharge in the middle of charge moves").
- AS BUILT (Phase D1): the flash kick: up + B in a slide (B's held through a slide, so up pressed with it counts, or B
  pressed with up held). To the engine and every boss fight it's an uppercut (their own detection, untouched), rising
  at its own pace to about half the uppercut's height (FLASH_RISE), counted as the SLIDE's move (tuning.ts meleeMoveOf
  reads `player.flashKick`), so bosses and sub-bosses get the leg armor's doubled share through bossMelee / subBossMelee.
  Regular enemies and critters are its own: everyone in FLASH_RADIUS 100 px takes FLASH_DAMAGE 150, once; a kill is
  weapons/dismember.ts sliceInHalf (two baked halves falling apart). No heal (not a grab). The power rule: tuning.ts
  setPowerHold (Meathead 2: a dive kick or the flash kick; the engine already held the charge, slide and uppercut).

### ARMGUARDS (forearms): the uppercut
- More damage on bosses; the uppercut goes higher/further. Hits enemies otherwise invulnerable to it.
- FOLLOW-UP: the NINJA DROP (Ryu Hayabusa's Izuna Drop): up with them, upside down, driven head-first into the
  ground spinning like a top: a near-guaranteed kill.
- AS BUILT (Phase D1): 12 frames on up with them (them upside down under him, him crouched on their soles), then down
  (to NINJA_FALL 22 a frame) spinning, head first into the floor: NINJA_DAMAGE (a regular enemy's dead), left legs up
  out of the floor twitching (9 s), the slam's shock round it, him hopping off. Nothing hurts him through it.

### HAND ARMOR (hands): the beatdown
- Beatdown works on regular enemies otherwise immune to grabs (the shakedown and air grab stay locked on them for
  good; the air grab is a mobility move, unaffected). Every beatdown hit heals more.
- With it, every other piece's follow-up works on grab-immune enemies too (without it, none do).
- AS BUILT (Phase D1, first part): grab.ts handsOnlyFoe (a regular enemy the grabs don't work on: not a boss, sub-boss,
  critter, one behind something, or one bolted down (unshakeable)): the beatdown's lunge takes it; every blow heals
  ×HANDS_HEAL 1.6. The cheap shot is Phase D2.
- THE CHEAP SHOT: Y+B on a land boss or sub-boss (not the Ensemble Cast; not machines: the orbit UFO, the wilds
  station, Steve's cars): a mini cutscene (no input, no HUD): he grabs them and kicks them in the balls/ovaries, then
  an animated close-up of the demolition, then back to the fight with the boss STUNNED 300 frames (5 s: four of the
  75-frame breathers: four free hits, which get the armor's boosted damage). Once per life.
  - Close-ups: Mortal Kombat X-ray style, GRAPHIC AND BLOODY, for Artie, Donnie, Steve, Harry, Tucker, Piper (ovaries;
    through layers of fat; glitter in the blood), Dad Guy, the hell demon. The Queen: he rips a panel off and smashes
    her robot ovaries. The rex: a crotch hatch, robot balls (the designers are silly people). The 5 White House
    pundits (Perot, Falwell, Limbaugh, Dole, Newt; cartoon projection): a 90s slapstick nut shot instead (eyes
    cross, the wheeze, hands to the crotch, knees together, keels over).
  - Harry: his nuts explode, and he still shoots Meathead for the grab after (once the stun's over), with new taunts.
  - THE STUN (2026-10-31: "give them all 'stun' poses/animations. they cannot be moved during this moment"): every one
    gets its own stun pose for the whole 300 frames (hands at the crotch, knees together, hunched, trembling, the
    wheeze, to the character), and nothing shoves, launches, slides or relocates them meanwhile. A FREE WINDOW
    ("initiating a stun will destroy/kill any active threats like cars/critters from the battle"; "it's basically a
    'free' window that blocks obstructions too"): the moment it starts, everything the fight has going at him (cars,
    critters, minions, shots, zones, pillars) is destroyed with a poof, a blast or gore; nothing new spawns till it's
    over; guards and blockers between him and the boss drop. Harry doesn't fire through it. The arena's own terrain
    stays.
  - Build it first as ONE generic version every boss uses, then each custom one.
  - BOSS GRAB RULES (2026-10-31): Y+B on a boss is NEVER a beatdown, only the cheap shot ("initiate grab when close,
    watch special animation"), once per life while their sex organs exist. Further grab attempts after it work as
    before (each boss's harmless reaction; Harry's pin-and-M60 counter: "harry is grabbable once. when you destroy his
    nuts. after that he counters"). Air grabs and shakedowns on bosses stay ineffective.
  - WHILE STUNNED, GRABS PHASE THROUGH (2026-10-31: "attempted grabs during the stun phase go through all of them.
    harry won't counter until he's active once more. trying to grab again when stunned will phase through"): any grab
    at a cheap-shot-stunned boss (the lunge, the shakedown, the air grab) passes clean through it, no balk, no
    harmless reaction, no counter. Harry counters again once the stun's over.
  - AFTER IT, NEW LINES for the rest of that fight (2026-10-31: "if you crush a boss's balls/ovaries, they get new lines
    for the remainder of the fight"): every boss and sub-boss it works on gets a crushed-nuts line set (squeaky,
    wheezing, vengeful, pitiful, to their sin) that replaces their usual taunt/hurt/attack pools until the fight ends
    (they die, or he does: a death resets it, like the once-per-life). Full clean/shitty/naked variants per the
    boss-lines rule. Voiced (npm run voices, m2pack).
  - AS BUILT (Phase D2, 2026-10-31): upgrades/cheapShot.ts (its README: the gate every boss's update asks, the stun,
    the line swap), closeUp.ts (the generic close-up: an X-ray panel over the middle of the screen, the still parts baked
    once; flesh: pelvis and thighs see-through, his boot up into it, balls squashed and burst (ovaries up behind a fat
    layer for the women), bone cracking, blood; machines: plates, gears, oil and sparks; the pundits: a slapstick face,
    the eyes crossing, OOOOF; Piper's blood has glitter), crushedLines.ts (450 lines: a scream, hurt, taunt, attack per
    boss, clean/shitty/nude, in each one's voice; Meathead's quip after). The grab's 'cheap' phase (grab.ts): Y + B,
    on the ground, within CHEAP_REACH 60 px of their side, ~2.3 s: a step in, the engine's standing kick, the boot lands
    (their scream cuts in; his quip queued after it), the close-up 96 frames (world.ts setScreenOverlay, from apply.ts),
    a hop back. Then CHEAP_STUN 300: the fight's own stunned mode where it has one (Artie, Donnie, the Queen, the rex's
    crash, the demon's stagger), else its AI skipped (Steve, Tucker, Piper, Dad Guy, the pundits); dizzy stars over
    every one (cheapShot.ts). Harry: stood put, the M60 still going, crushed barks. Grab counters (Artie's knife,
    Harry's pin) don't fire while stunned. A death forgets it all (a new life: a new cheap shot each). Not on: the
    Ensemble, the orbit UFO, the wilds station, Steve's cars. The rex is gated on its legs part (the body's too high).
  - FOR PHASE F: the custom close-ups go in with registerCloseUp(id, paint) (closeUp.ts: paint the panel's insides for
    frame t of CLOSE_LEN, the boot landing at CLOSE_HIT); none of the fights has a hands-at-crotch stunned pose yet
    (they used their dazed/hurt poses then; see the stun poses' AS BUILT below).
  - AS BUILT (stun poses, 2026-10-31): cheapShotStunT(e) (frames into the stun) drives each fight's own stun pose:
    Artie's 'clutch' (river/artie.ts, helmet askew, squeak), the rex's knock-kneed crouch with the hatch flapping open
    and sparks (dino/rex.ts), Brathazar's clutch with the guitar dropped flat on the floor (hell/demon.ts; it was stuck
    out across Meathead), Donnie's hands-under-the-gut 'clutch' (spooky/donnie.ts), the Queen's 'cheap' (panel ripped
    off, sparking wires, glitching face; queen/sprite.ts), Steve's 'cheap' (his cup drops out and splits; stunt/steve.ts),
    Harry's clutch (foreign/harry/rambo.ts), Tucker's 'clutch' (coins dropping out of his vest; frontier/tucker.ts),
    Piper's 'clutch' (on her knees, wings drooping, glitter; fantasy/piper.ts), Dad Guy's seated 'nuts' (the late
    reaction, the can spilling SWILL LITE; amphi/dad.ts), the pundits' 90s 'nut' pose with a gag each (whitehouse1/2
    punditArt.ts). The only stars are cheapShot.ts's shared ones (the fights' own are off while it lasts). No-move:
    each fight's knock/jostle/dodge/bounce paths gated on cheapShotStunned. Free window: registerClearThreats (each
    fight's wipe-out, run as the stun starts; the engine's enemy shots in the air go too), each fight's spawners
    paused while stunned; grab.ts skips stunned bosses in every grab's reach.
- AS BUILT (Phase F, 2026-10-31): all 15 custom close-ups, upgrades/closeups/<id>.ts (registered from closeups/index.ts,
    called once from apply.ts), sharing fleshKit.ts (the five male X-rays), specialKit.ts (Harry, Piper, the demon, the
    Queen, the rex) and punditKit.ts (the pundits' slapstick), plus closeUp.ts's exported pieces (drawKick: the boot or
    the sabatons; bakeOnce: still layers painted on first use, never at load). Sin twists: Artie's stuffed sock and #1
    buckle, Donnie through the fat, Steve's cup and green bile, Tucker's gold coins, Dad Guy's late reaction, Harry's
    nuts explode, Piper's glitter through the fat, Brathazar's three scaly balls and lava blood, the Queen's panel ripped
    off, the rex's hatch ("TESTICULAR UNIT - DO NOT KICK"); the pundits each keel over with a gag. Under ~1.4 ms a frame
    (the fight's frozen while it's up); the first showing paints its layers (a possible small hitch once).

### HELMET (head)
- All damage he takes is cut 25%: anything that isn't an instant kill (enemies, bosses, hazards). Instant kills still
  kill.
- Regular enemies' projectiles that hit his head area are absorbed (no hurt). Not bosses' or sub-bosses' (they only
  get the 25%), not big things (cars). Ducking makes the blocked area bigger (TUNE).
- AS BUILT (Phase D2, 2026-10-31): helmetStops/helmetStopsAt (gear.ts) now also guard the jungle monkeys' poo and fruit,
  Spooky's town lobs, tower bouquets and gift-shop globes, Future's square shots, crater soldiers' bolts and the
  Queen's spitter gobs, Hollywood's coaster plungers, warehouse extras' coffee and food, and havoc looters' loot,
  Wilderness porcupine quills, Fairy's wheel throws and glen, keep (pins, fans) and square throws (spark, slipper,
  ball), and Cartoon's kiddie hats and paint, studio plates and coffee, White House clipboards and money bags, big-kid
  cones, glop and churros (churros run 30 wide: over HELMET_MAX_SHOT) and Itchy cleavers. Left out: traps (temple and
  cart darts, books), fire (imp fireballs, flames), gas (stink bombs), ground waves and rolling boards, beams and
  laser dots, ride and set-piece shots (Tragons, dirt bike, heli mechs), the warehouse cast's props and string.

### AMULET (neck, on his bare chest): the PISS-OFF YELL, passive
- A piss-off METER: damage he takes fills it, it slowly drains (TUNE: full at ~35 damage, drains ~3.5/s). Full: he
  screams an echoey "FUCK OFF" (voiced, with an echo): it hits EVERY ACTIVE ENEMY on screen: regular enemies stunned,
  mild damage to everything (bosses too). Then he's invulnerable a while (TUNE: ~3 s, maybe longer) and nothing knocks
  him back meanwhile (no launches, no shoves: Steve's cars). Then ~10 s before it can fill again.
- THE RAGE HITS HARDER (2026-10-31: "all attacks get a damage boost during meathead's 'fuck off' invincibility. not as
  much as 'bulk up', but a good boost. you can be 'bulked up' and 'pissed off' and your melee attacks will really be
  devastating", then "all charge/grabs that is, like bulk up"): through the post-yell invulnerable stretch his CHARGE
  MOVES and GRABS hit harder: the charge, slide, uppercut, dive kick, flash kick, the follow-ups, and every grab's slam,
  suplex, throw, splat and beatdown blow; on regular enemies, sub-bosses and bosses. NOT his weapons (the ray gun and
  the special weapons as ever). TUNE: ×1.5 (tune.ts RAGE_DAMAGE_K). Under the bulk up's own (its knock ×2.2, its
  beatdown blows ×2.5), and the two multiply: bulked and raging, a beatdown blow's ×3.75. Bosses keep their 75-frame
  breather: the amount's bigger, not the rate.
  AS BUILT: amulet.ts rageDamageK() / raged(n). Bosses and sub-bosses: bossMelee.ts (a land boss's 37.5 a move → 56.25,
  75 → 112.5 with the piece; a sub-boss's 52.5 → 78.75, 105 → 157.5). Everything the engine's moves hit (regular
  enemies, the engine's bosses, the ensemble, the machines): apply.ts's melee hook. The grabs: moves/grab.ts (each
  damage it deals, the aftershocks, slam shocks and crushes included). The follow-ups: moves/followups.ts (the meteor,
  the flash kick, the kicked head; the missile through grab.ts's thrown-body hits; the ninja drop kills anyway).
  Misses: the hand armor's cheap shot (a stun, no damage), the ensemble's shake-off chip when he charges one off him,
  and the bodies his charges fling into others (the engine's collateral, mass × speed: like the bulk up's, it grows
  with how hard they fly, not this). No separate visual tell: the red rage aura round him is it.
- Toggle on/off in the PAUSE MENU (shown once he has it).
- Shown: his in-game face gets angrier as it fills. On the HUD (top-left panel, without making the HUD bigger: the
  weapon row's ammo bar is long, share that row): a DOOM-STYLE FACE (Meathead, glasses on) and a small upright meter
  beside it whose color shifts as it fills. The face's HURT (bloodier as his health drops) and ANGER (the meter) are
  separate layers. Shown once he has the amulet.
- AS BUILT (Phase C, 2026-10-31): amulet.ts, AmuletHud.tsx, amuletFace.ts; numbers in tune.ts. The meter counts what
  actually comes off his health (after the ×0.65 soft hits and the helmet). The yell: 15 off everything on screen;
  regular enemies it doesn't kill are knocked a step and stunned 1.5 s; bosses and sub-bosses take it through their
  own fights (the land bosses read it with takeYell, inside their 75-frame breather as ever). The voice is its own
  (cast.json m2.yell, fx 'echo'). The pause menu's AMULET ON / OFF sits on its own row under the buttons. In the cheats'
  god mode (nothing comes off him) each fresh hurt counts 8, so it can still be tried out.

### CAPE (back)
- "cape should somewhat increase general movement speed, jump height and add a float ability" (2026-10-31): somewhat
  faster walking/running (TUNE ~+12%), somewhat higher jumps (TUNE ~+15%), and hold jump in the air to float slowly
  down, steering: SUPER MARIO WORLD's cape (TUNE).
- THE CAPE AND THE BULK UP (the spellbook's: speed ×1.6, src/m2/weapons/spellbook.ts BULK, through buffs.speed): "a
  'bulk up' effect with a cape upgrade should increase your movement speed even more. a cape's movement speed increase
  shouldn't be as much as a non-cape bulk up." So the cape's speed boost is well under the bulk up's (~×1.12 < ×1.6),
  and they STACK (multiply): bulked with the cape ≈ ×1.8. Keep it short or split from behind so his jeans' seat still shows.

### Dad Guy
- He still knocks Meathead back off a charge move; with that move's armor piece, the move hurts him during the
  i-frames (and a cheap shot may come of it). Without the piece, no damage, as now.

## Follow-ups, generally
- The window: during the move and ~24 frames after it (TUNE; it was ~30 after a hit). Follow-ups DON'T HEAL (the owner, 2026-10-31: "followup grabs shouldn't heal. they are meant for big damage mainly"; the standard beatdowns and air throws still do). Not on critters (Y+B on a critter
  is still the critter grab). Not on grab-immune enemies without the hand armor.
- PEOPLE AND ANIMALS (2026-10-31: "for any of the new grabs, be sure to account for the correct orientation, like we did
  with shakedowns and beatdowns"; "new grabs do work on mid sized animals though... any animal you can beatdown or
  shakedown"; "new grabs don't work on critters too"): they work on exactly what the beatdown and shakedown do
  (followable: grabbable() people and mid animals, plus grab-immune ones with the hand armor; never a critter). An
  animal goes the grabs' animal way: the missile holds it by the scruff, body trailing; the spin drills it in on end,
  rump first, head out; the head kick punts its own head (baked as it looked alive, turned on end); the ninja drop
  drives it down on end head first, then leaves it on its back in the dirt, four legs up, kicking in fits; the flash
  kick slices it nose to tail through the head (dismember.ts sliceInHalf: a slanted cut, head to rump), the top half
  sliding off the bottom.
- NO HIT NEEDED (2026-10-31: "make the special 'followup grabs' more noticeable and not require a hit confirmation but
  rather just within a quick window of doing the charge->grab", "but give the new 'special grabs' a wide berth, wider
  than what appears"): Y+B during the move or within a short window after it grabs the nearest followable enemy in a
  generous reach. Same eligibility as before. A visible and audible cue while it's on offer; a punchy start.
- AS BUILT (Phase D1, reworked 2026-10-31): moves/followups.ts notes the last frame he was in a dive kick, charge (not
  a slide) or uppercut (not the flash kick). Y + B (or the beatdown key) during it or within FOLLOW_WINDOW 24 frames of
  it ending, in that move's piece, takes the nearest followable enemy whose near edge is within FOLLOW_REACH 200 px
  across (the charge's FOLLOW_REACH_CHARGE 260) and FOLLOW_REACH_UP 200 up/down of his middle (one behind him counts
  80 px further; the one the move hit, if any, comes first; the spin's only one stood on the floor; nothing solid in
  between), and the follow-up starts there and then, whatever he's in the middle of. The ninja drop dashes over to one
  that's off a way first (5 frames). THE CUE while one's on offer: corner brackets and a glint on the target flickering
  in the piece's colors (sabatons cowbell gold on rust, pauldrons leopard on jungle green, armguards neon cyan and
  magenta), the piece on him twinkling, a Y + B prompt over the target (WorldPrompt.tsx, the real buttons), a twinkle
  sound as it comes on. THE START: rings bursting off him and them and a streak between, a spray of the piece's colors,
  a jolt, a bang, its name (MISSILE! / PLANTED! / NINJA DROP!). Never on a boss or a sub-boss (the Ensemble's actors
  included); a Y + B next to a boss inside the window takes a regular enemy in reach over the cheap shot. Each heals
  No heal. The slide has no follow-up (its trip is the keep-away; the flash kick is up + B).

## CON-FUCK-TIOUS (not now)
Meathead's old gym buddy (CON-FUCK-TIOUS is only Meathead's name for him): plays the wise old dojo master, actually a
dirty fighter selling cheap gear; Meathead looks up to him like the father he never had. He's in a secluded spot in each
land, practicing that land's move; meeting him gives the piece. NOT in the levels yet; build him after the rest.
- HIS DOJO (future, 2026-10-31: "when you find con-fuck-tious at least once, he will bolt on his own dojo to the top of
  the employee break room. here you can follow his guided tutorial on the new moves again that he will give"): after
  the first meeting, a cheap bolted-on dojo appears on top of the employee break room (the hub's staff room). In it he
  replays his guided tutorials for every move/piece he's given so far, on request.
