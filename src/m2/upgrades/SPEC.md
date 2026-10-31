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

Provisional land themes (the owner hasn't assigned lands yet; use these until told): Jungle: khaki, bamboo, leopard,
tusks; Spooky: bat wings, coffin wood, plastic skulls; Future: chrome XENOSCARE resin, neon; Hollywood: gold statuette
plating, film reels, a stunt pad; Foreign: flag patches, a Viking horn; Wilderness: rusted railroad iron, a cowbell;
Fairy: pink sequins, glitter crystal, tiara spikes; Cartoon: flat, outlined, a big white glove.

### SABATONS (feet): the dive kick
- More damage on bosses; the dive kick goes further. Ignores spikes: the spiky enemies that punish a dive kick (KindDef.spiky) and spike hazards.
- HIT-CONFIRM FOLLOW-UP: Y+B (the beatdown chord; R on the keyboard) shortly after a non-fatal dive-kick hit: he flips
  upside down, grabs the enemy by the shoulders, flips around (swinging them up and over) and hurls them straight
  ahead at high speed: the enemy is a MISSILE into whatever's ahead. Weight counts (melee collateral: mass × speed),
  more potent than the shakedown's throw. Works on enemies in the air too; gravity arcs the throw down. No steering.
- AS BUILT (Phase D1, 2026-10-31: moves/followups.ts): flipped over onto them (8 frames), swung round (12), let go
  straight ahead at MISSILE_SPEED 25 (the throw's 17), a body thrown with its collateral ×MISSILE_HIT_K 1.6 (cap 256);
  `dropping`, so a flyer falls too. Nothing hurts him through it (like the air grab). Heals FOLLOW_HEAL.

### PAULDRONS (shoulders): the shoulder charge
- More damage on bosses; the charge goes further. Ignores what punishes a charge: horned beasts, spear enemies (KindDef.pointy).
- FOLLOW-UP: Y+B after a non-fatal charge hit: he grabs them and SPINS THEM INTO THE GROUND, stuck for good with just
  their head out: harmless. Only on an enemy standing on the ground. The charge pushes them back, so the follow-up's
  reach is wide.
- THE HEAD KICK: B near a head sticking out of the ground: he kicks the head off like a football, a projectile into
  other enemies. If his side would kick it at nobody, he walks round to the other side and points at the enemies
  first, then kicks.
- AS BUILT (Phase D1): the reach is FOLLOW_REACH_CHARGE 190 px; he steps in, lifts, and drills them down to the neck
  (their kind's head height); the head's out of the enemy list (it counts as gone), looks at him, and stays for the
  stage (12 at most). B on its own within HEAD_KICK_REACH 64 of one: the kick, aimed in an arc at the nearest enemy that
  way (HEAD_HIT 70 to whoever it hits, a bounce off them); the stump spurts and goes after 6 s. The head itself is
  baked once out of their picture and drawn turned. Callouts PLANTED / FIELD GOAL.

### LEG ARMOR (knees and shins): the slide tackle
- More damage on bosses; the slide goes further. Ignores damage from the front while sliding.
- A non-fatal slide TRIPS / STUNS any enemy and DOESN'T STOP HIM (no bounce-off; he slides on through). Bosses can't
  be tripped (they just take the damage). NO follow-up grab: it's a keep-away tool.
- THE FLASH KICK (2026-10-31: "pressing up+b during a slide tackle will do a [Guile] like flip kick"): not a hit-confirm
  like the other follow-ups: Up+B at any point DURING a slide (the leg armor's longer slide gives room for it) launches
  Guile's flash kick, a backflip with the leg sweeping up in an arc. Costs ONE power cell; can't start with less.
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
  - Harry: his nuts explode, and he still shoots Meathead for the grab after, with new taunts.
  - Build it first as ONE generic version every boss uses, then each custom one.
  - AFTER IT, NEW LINES for the rest of that fight (2026-10-31: "if you crush a boss's balls/ovaries, they get new lines
    for the remainder of the fight"): every boss and sub-boss it works on gets a crushed-nuts line set (squeaky,
    wheezing, vengeful, pitiful, to their sin) that replaces their usual taunt/hurt/attack pools until the fight ends
    (they die, or he does: a death resets it, like the once-per-life). Full clean/shitty/naked variants per the
    boss-lines rule. Voiced (npm run voices, m2pack).

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
- The window after the hit: ~30 frames (TUNE). Follow-ups heal like the other grabs. Not on critters (Y+B on a critter
  is still the critter grab). Not on grab-immune enemies without the hand armor.
- AS BUILT (Phase D1): the last of his moves to land is noted from the engine's melee hook (upgrades/lastHit.ts);
  Y + B (or the beatdown key) within FOLLOW_WINDOW 30 frames of a hit that didn't kill, in that move's piece, near
  enough (FOLLOW_REACH 130 across, 170 up/down; the charge's 190), and the follow-up starts there and then, whatever
  he's in the middle of (a bounce, a recoil). Never on a boss or a sub-boss (the Ensemble's actors included). Each
  heals FOLLOW_HEAL 12 (×healK). The slide has no follow-up (its trip is the keep-away; the flash kick is up + B).

## CON-FUCK-TIOUS (not now)
Meathead's old gym buddy (CON-FUCK-TIOUS is only Meathead's name for him): plays the wise old dojo master, actually a
dirty fighter selling cheap gear; Meathead looks up to him like the father he never had. He's in a secluded spot in each
land, practicing that land's move; meeting him gives the piece. NOT in the levels yet; build him after the rest.
- HIS DOJO (future, 2026-10-31: "when you find con-fuck-tious at least once, he will bolt on his own dojo to the top of
  the employee break room. here you can follow his guided tutorial on the new moves again that he will give"): after
  the first meeting, a cheap bolted-on dojo appears on top of the employee break room (the hub's staff room). In it he
  replays his guided tutorials for every move/piece he's given so far, on request.
