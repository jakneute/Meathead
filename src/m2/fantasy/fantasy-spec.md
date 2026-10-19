# Fairy Land (land id `fantasy`): the spec

Given to every agent working on the land. The user's brief first, verbatim; then the fill-ins (decided by us, the
user's to overrule), the section plan, the standing rules, and the decisions log (newest last).

## The user's brief (verbatim)

```
next up: fairy land

the great pixie's castle is a monument that exists as a visible background element that gets progressively closer the whole stage. not mode 7 closer but a new scene, its background element is larger.

we begin with a standard platforming sequence in a town square. theme it as a combination of harry potter lands in islands of adventure and fantasy land in Disney world. various primarily human enemies will be in your way. introduce a new mechanic in these sections too. i'll let you know what i think of it. surprise me.

you eventually reach a loudspeaker, the speaker is a sultry sounding woman named "piper the pixie" she asks you to 'overcome trials' and 'win an audience with me'. don't spell it out explicitly, but the prize is sex. meathead gets aroused at this idea. "i'm winning these trials, losers". he thinks with his dick during this sequence. the first trial is the 'fairy wheel', it's a ferris wheel. there are other suitors who want piper. one of the lines meathead can say about her is "piper? i will pipe her. with my dick." for the fairy wheel sequence, make it gigantic and fairy themed. the other suitors are always male and they are beefy too. they sit from their fairy wheel carts and throw crap at you and each other, trying to stop you. you cannot shoot them. you need to jump to their cart. when you do, various qte sequences start that you need to pass. when you win, show a funny animation of meathead killing one of the suitors in his fairy wheel cart. smashing him into the wall, throwing him off. etc. losing the qte will knock you away for heavy damage (not kill you) unless it is enough to cause the hp value to drop to zero. when all suitors are dead, go through another fantasy themed area with escalating platforming/enemy challenges.

eventually you reach a ride called "truelling tragons". a parody of dueling dragons, only there are three cars instead of two: a fire, an ice and a lightning car. you cannot fire during this section; you can press next/previous weapon to jump between cars. you often will need to because sometimes the track goes away and need to jump to one of the other three cars. sometimes only one car is safe to stand on. give a little cooldown for jumping when using the mousewheel or pressing lb/rb to hop trains. each train has somewhat different obstacles. make sure all three are shown and zoom in/out as needed. give warnings that you need to jump to another track if a hole is coming up. i'd like to keep it side viewed. not too tangly but readable in the chaos.

eventually you enter the base of the great pixie's castle. go through more standard platforming stuff until you reach a 'fantasy' themed runway outside for the final trial: broomstick deathmatch. you hop on a broomstick and enter an 'free range' arena. use mode 7 style trickery here. pressing Y or alternate fire will turn on/off inverted up/down controls. X button fires. and you gotta fly around and kill all other suitors in the flying broom section. it's a behind the back section, just like the road rash section. when you kill them all, meathead flies into the highest window of the building. it will zoom in rapidly and show a fancy 'shattering glass' effect when you get in, and it will transition to outside the 'great pixie's bedroom'. if you happen to be naked, meathead will have a boner during this part. you kick down the door to her chambers and a boss fight will commence. i don't have mechanics yet, but she will be morbidly obese and meathead's boner will slowly go flaccid when he sees her. only when he's nude by the way. he will insult how fat and ugly she is, which enrages her and starts the actual boss fight.
```

The user's notes since (relayed):

- "her sin is lust i suppose" (each boss has a sin: Tucker's was greed).
- Refined: her LUST is mainly NOT sexual on her side: it's a lust for being fought over. She gets her enjoyment out of men
  killing each other for her. The trials are her bloodsport; the promised "audience" is bait for the suitors (they, and
  Meathead, read it as sex: keep that innuendo on their side). Her loudspeaker lines purr over the violence and the
  rivalry (thrilled by the blood, egging them on, savoring each death), and she's coy about what the prize really is.

## Fill-ins (ours; the user's to overrule)

- **The land's weapon:** the SPELLBOOK (store.ts LAND_WEAPON: fantasy -> SPELLBOOK). The walk-away's placeholder hands it
  over (walkAway/piper.ts, its act: walkAway/acts.ts's SPELLBOOK).
- **The new mechanic (the user's "surprise me"): ENCHANTED SHIFTING STAIRCASES** (stairs.ts). Hogwarts-style: a flight of
  stairs pivoting at one end swings on a schedule to dock at a different landing every few seconds. The tell before
  every move: a creak and a glow (gold along the stringer, a wave of light up the treads, sparkles, a rune ring at the
  pivot). Stood on it, he's carried round with it; he walks up and down it, times jumps on and off, rides it to reach
  places; some swing out over drops; a 'ride' kind waits till he's on it and swings away mid-climb. Its treads stay
  level as it turns (it's enchanted) and are lit along their tops (standable reads standable); from under, it's a
  jump-through. Kept within ~45 degrees of level always (walkable). The cast don't use them. Taught alone in a safe spot
  in the town square, then built on (stairs + enemies, a chain over a gorge, a tower of them). Later sections place
  their own (makeStairs / updateStairs / drawStairs).
- **The monument:** monument.ts, one shared painter (crude-but-readable first pass; painted once per hour and size, a
  stamp), drawn in each section's far layer at that section's size (MONUMENT_AT: the square 0.42, the wheel 0.6, the
  glen 0.82, the ride 1.05, the castle's base 1.75 (looming, its top out of the picture), the broomsticks and the
  bedroom bigger still for their own views). Within a section it drifts slowly across the sky as he goes, so it's always
  there. PIPER_WINDOW: the highest window (pink stained glass, a heart in it, glowing): the one the broomstick flies in
  through. The walk-in and the walk-away draw it too (drawCastleAt).
- **The parody's names (legally distinct):** HOGSMEAT VILLAGE (the snowy, crooked-roofed shopfronts), WANDS & SONS (the wand
  shop: its clerks cast cheap pyrotechnic "spells"), BUTTER BREW $14 (the butter drink, off a cart), the FAIRY LAND EXPRESS
  at PLATFORM 7 5/8 (the train; its brick pillar is just a wall), the PRANCING PONY CAROUSEL, the GINGERBREAD LANE
  (Snow White / Pinocchio village), BROOMBALL (the sports fans' game: the bro's), THE GRAND STAIRCASE (the tower of
  staircases at the square's far end), THE GREAT PIXIE'S CASTLE.
- **The town square's cast (all new kinds, `m2:fa_*`, square/kinds.ts):** humans first (men and women of every skin, build
  and hair, seeded; the princess and the knight on anybody), plus one animal in the air:
  - WAND CLERK (`fa_clerk`): robes, a pointy hat, a wand: keeps back, waves the wand (the tell: sparks gathering, a
    shouted spell name) and casts a sparkler bolt that arcs at him; up close a poke in the eye with the wand.
  - PRINCESS (`fa_princess`): a gown, a tiara, a glass slipper: the slipper wound up and thrown (it smashes); up close a
    twirl and a slap.
  - KNIGHT (`fa_knight`): a tabard over foam plate, a visor, a foam lance couched out front (POINTY: no shoulder
    charging into it from the front): lowers the lance (the tell) and charges.
  - BROOMBALL BRO (`fa_bro`): a jersey, a backwards cap, a foam finger: whips a hard broomball that bounces; up close a
    chest bump that sends him flying.
  - COSTUMED TROLL (`fa_troll`): huge, a green foam suit, a horned helmet (SPIKY: no dive kicking onto the horns), a
    foam club: up over his head (the tell), slammed down: a shockwave along the ground (jump it).
  - DRAGON MASCOT (`fa_dragon`): a big plush dragon suit, the performer's face in its mouth: rears back, a puff of smoke
    (the tell), then a short cone of flame (the pyro rig in the head).
  - MAIL OWL (`fa_owl`): a real trained owl from the owl show: circles, hoots (the tell), swoops at his head.
  Each drawn hurt, knocked about (held, flung, dazed) and dead so the engine's special deaths play out on their real
  sprites; their deaths show the costume giving (a hat flying, the troll's head off, the dragon's head rolling).
- **Hazards in the square:** the SNOW off the crooked roofs (the eave sheds a trickle and creaks (the tell), then the slab
  drops: everybody under it), the BUTTER BREW KEG (hit it and it bursts: a geyser of hot foam over everybody near), the
  GORGE (painted clouds a long way down: a fall). Every one hurts the cast too; none of the cast stand in one's way.
- **The loudspeaker scene (the square's end):** the town's PA horn up a lamp post over the bandstand. A cutscene (HUD
  hidden, no input, SKIP >> for the lot): the chime, PIPER THE PIXIE over the speaker (sultry; her lust is for being
  fought over: coy about the prize, purring over the blood), the beefy suitors around the bandstand reacting (the
  rivals of the trials: three of them introduced, fantasy/suitors.ts), Meathead aroused (hearts up off him, a boing): "PIPER?
  I WILL PIPE HER. WITH MY DICK." and "I'M WINNING THESE TRIALS, LOSERS." (the user's lines, verbatim), then black and on
  to the fairy wheel. From here he thinks with his dick (lines.ts HORNY: for every later section to use).
- **Piper drawn at full detail from the first pass** (piper.ts): morbidly obese, a pixie (gossamer wings too small for
  her, a tiara, a star wand), a glittery pink gown straining at its seams; poses for the later jobs (lounging, talking,
  enraged, a close-up portrait). She isn't seen in the square (only heard).
- **Piper's fight:** NOT designed (the user hasn't given mechanics): the bedroom section is a placeholder end (the
  boss-door refill, her door, VICTORY, the walk-away, the hub). Don't invent the fight.
- **Music:** none yet. Fairy Land's in music/cues.ts's LAND_OF_STAGE, and with no `land:fantasy` song it's quiet (the
  music job adds the songs).

## The section plan (world x; checkpoints numbered across the land)

FAX = 800000. Gaps of 3000 between sections (room to grow). Every section about a fifth of the land or its time.

| # | Section | id | World x | Checkpoints | What |
|---|---|---|---|---|---|
| 1 | The town square | `square` | FAX+0 .. FAX+15000 | 0-9 | Hogsmeat Village and the storybook square; the staircases; the loudspeaker |
| 2 | The fairy wheel (trial 1) | `wheel` | FAX+18000 .. FAX+24000 | 10-12 (of 10-19) | The gigantic wheel, eight suitors in its gondolas throwing crap, the QTEs, the kills (built) |
| 3 | The enchanted glen | `glen` | FAX+27000 .. FAX+41000 | 20-26 (of 20-29) | The storybook forest: toadstools, briars, cauldrons, harder staircases, five new kinds; the ride's queue (built) |
| 4 | Truelling Tragons | `tragons` | FAX+44000 .. FAX+58000 | 30-38 (of 30-39) | The three-car coaster (fire, ice, lightning): hop cars, holes, each car's obstacles, the rivals (built) |
| 5 | The castle's base and the runway | `keep` | FAX+61000 .. FAX+73000 | 40-49 | Platforming in the castle; the runway (from x0+9000) |
| 6 | The broomstick deathmatch (trial 3) | `broom` | FAX+76000 .. FAX+80000 | 50-59 | Behind the back, mode 7; in through the top window |
| 7 | The bedroom and Piper | `bedroom` | FAX+83000 .. FAX+87000 | 60-69 | The door kicked in, the reveal, the fight (placeholder) |

(The trials: the wheel's trial one, the broomsticks' the final one; the ride's between them is "trial two" if the
fairy wheel's job wants to call it that.)

### Section 1 in detail (the town square, built: square/)

x from the section's start; heights up from the ground line.

- 0 THE STATION (cp 0): off the walk-in, the FAIRY LAND EXPRESS at PLATFORM 7 5/8 (its brick pillar: charge into it and
  it's a wall), the land's sign; a lone wand clerk.
- 1300 HOGSMEAT HIGH STREET: crooked, snowy shopfronts; the first roof shedding snow, alone; the butter brew cart and its
  keg among a knight and a clerk; a roof shedding snow over a princess's beat.
- 3200 WANDS & SONS: the first staircase, alone and safe (it swings up from the street to a bridge across to a ledge with
  a pickup, and back down: ride it up to the balcony over the shop, the way on); the rooftops after.
- 4800 THE SQUARE (cp 1): the Prancing Pony Carousel, its canopy up a staircase with a clerk casting at him from the
  top; a bro and a princess on the cobbles; an owl.
- 6400 THE GORGE (cp 2): a chain of staircases over painted clouds (one dips down into the gorge and back, one swings up and
  away to a reward, one swings between the far bank's ground and a gingerbread roof); an owl and a clerk.
- 8600 GINGERBREAD LANE (cp 3): the troll by his bridge, the dragon mascot, snow off the gingerbread roofs (a bro just
  past one: shove him in), knights.
- 10600 THE GRAND STAIRCASE (cp 4): a tower of staircases swinging between landings, clerks and a bro on the landings,
  an owl in the shaft, a 'ride' staircase that swings away mid-climb; out over the top and down.
- 13200 THE BANDSTAND (cp 5): the last mixed crowd; the loudspeaker on its lamp post, the suitors; the scene.

### Section 2 in detail (the fairy wheel, built: wheel/)

x from the section's start; heights up from the ground line.

- 0 THE PLAZA (cp 10): in off the loudspeaker's scene; the wheel's sign, the ticket booth, the empty queue rails.
- 1650 THE GATE: walk past 1760 and the trial's on (cp 11 at 1820): the rose gates shut both sides (a pink shimmer up
  into the sky over them), boss-fight quiet, Piper on the PA. Both stay shut till every suitor's dead; the one back
  stays shut after (this visit).
- 3000 THE FAIRY WHEEL: its hub 790 up, its gondolas' pivots 620 out, 24 gondolas hung 112 under them (floors from
  ~60 up to ~1300), turning clockwise about a pixel a frame at the rim (a turn a minute). Each gondola's floor a
  moving ledge (stood on, he's carried round); level, lit along its top. Neighbors are close enough to hop across at
  the top, the bottom and the slants; up the sides they're too far apart: ride. A suitor in every third (eight).
- 4350 THE FAR GATE: open once they're all dead; cp 12 at 4560; the way on to the glen (its sign at 5200).

### Section 3 in detail (the enchanted glen, built: glen/)

x from the section's start; heights up from the ground line.

- 0 THE GLEN GATE (cp 20): in from the wheel under a branch arch; a lone HUNTSMAN; Piper's first PA horn.
- 1500 TOADSTOOL HOLLOW: the MUSHROOM TRAMPOLINE taught alone (a mossy cliff 280 up, a toadstool in front of it; a
  second on the far side for the way back); a gingerbread man past it.
- 2700 THE BRIAR PATCH: thorns 2780-3600, three toadstools across them; an owl over them, a wand clerk after.
- 3900 THE STORYBOOK BRIDGE (cp 21): the bridge is out over a misty gorge (4300-5100): two staircases swinging in
  opposition (left bank to the middle pillar; the pillar to the right bank; each level while the other's down in the
  gorge); a witch over it; the troll on the far bank.
- 5500 THE WITCH'S COTTAGE (cp 22): a swinging cauldron alone over the path (5800); the candy cottage (6300-6660, roof
  200: too tall to jump) up its staircase off the roof's corner with a cauldron swinging across the flight and another
  over the roof; the garden (a cauldron off a branch at 7000, gingerbread men, a witch); a woodpile round the back for
  the way back up.
- 7400 THE DWARF MINE (cp 23): a team of three dwarfs by the portal; the shaft (8200-9474): a chain of four faster
  staircases (110 hold, 50 swing) between three timbered pillars (60, 120, 60 up); an owl, a witch, a dwarf throwing
  from the far side.
- 9630 UNICORN MEADOW (cp 24): a unicorn alone; briars (10340-10860) with two toadstools over them under a huntsman's
  tree stand (300 up: a toadstool bounce with jump held gets there; a pickup); a witch; a second unicorn.
- 11160 THE DRAGON'S LAIR (cp 25): the dragon mascot by the fiberglass skull; a toadstool up to a ledge (170), the RIDE
  staircase off it (level out over a briar floor; stood on it 30 frames, it tells and swings him up to the top landing,
  434) with a huntsman shooting down it from the top, a witch and an owl; the lair's back wall (534) and down its far
  side's shelves.
- 13160 THE QUEUE (cp 26): a last crowd (a knight, a witch, a gingerbread man, a princess); the rivals in the queue's
  rails (BLAKE, RAFAEL, HANK) have their say in turn, he answers, Piper calls trial two over the ride's PA, and they go
  in; the ride's door is the section's right end (on to Truelling Tragons).

### Section 4 in detail (Truelling Tragons, built: tragons/)

World x from the section's start; the ride by track position `s` (the trains stand still in the world once they're
out of the station, rears at x0+2500, and the world goes by: layout.ts wxOf). Lanes top to bottom, never crossing:
LIGHTNING (yellow/purple), FIRE (red/orange), ICE (blue/white).

- 0 THE LOAD STATION (cp 30): in from the queue; the hall (three dragon heads over it), NO FIREARMS ON THE DRAGONS; the
  three dragons parked at three heights (Blake sat on the FIRE one, Rafael on the LIGHTNING one), the ICE one at the
  platform (70 up: hop onto its back). On it a moment and the gate (1360) swings open and they go (back on the
  platform before they're out: they stop and come back for him).
- THE RIDE (~46500 of track, ~5 px a frame teaching, 6 after, 6.5 late; a little over two minutes): s 1500 THE LIFT
  HILL (cp 31): the spiel, the rules, Piper; the first hole alone on his (a 270-frame warning, slow), another. 8000 THE
  GAUNTLET (cp 32): duck waves, jump waves, a thrower wave, a hole. 16000 BLAKE (cp 33): the first near miss (140 apart),
  Blake up. 22400 ONLY ONE SAFE (cp 34): holes on two lanes at once (the one next to his safe; then the far one: two
  hops). 28700 RAFAEL (cp 35). 35000 HANK (cp 36): in on the spare dragon after an `other` hole. 40100 THE TRIPLE NEAR
  MISS (cp 37): one safe, then another, a duck and a jump. The brakes; END_S 46500.
- THE UNLOAD (cp 38, set as it pulls in): a deck a lane off the dragons' fronts (stepped: drop down them), the hall,
  UNLOAD / EXIT TO THY RIGHT; the castle's gate arch at x0+4300 (on to the castle's base).

## Standing rules (all apply; check every one against new work)

American spelling; signs readable, held up, themed lettering (storySign: a shingle off an iron bracket, gilt letters);
dialogue blunt, short, vulgar, specific (talk less); clean / shitty / naked pools for Meathead and everybody reacting to
him (the naked pools can play up his arousal); pickLine; no line twice within 45 s; speech text only while spoken; no
talk-over; cutscenes hide the HUD, skip all-or-nothing, no player input; subtitles whole on screen; death-screen text 28
characters at most; every new hurt source gets voiced hurt and death lines; never spell out that Meathead arrives
anywhere by accident. Standable reads standable; impassable reads impassable; NO DUCK / JUMP text on obstacles; hazards
hurt enemies too (none spawn in a hazard's path); despawned enemies never count as kills; kill callouts per kind;
checkpoints restore world state; no backtracking after one-way sequences (free within sections); fake-3D rules (one
shared eye, no depth layer over nearer things, cull by the real view, interiors hidden until entered, signs attached);
lights soft; NO VOLCANOES; no walk-right-and-hold-fire stretches (mix airborne and grounded threats); M2 lean drops and
softer hits; a boss-door refill before the boss; main bosses 666 HP, the 60-frame breather, non-weakness damage 35%;
markBossFight every frame of a boss or sub-boss fight. Voice every new line (`npm run voices`, `npm run voices:m2`).

## Decisions log

- (job 1) Skeleton: seven sections at FAX = 800000 with 3000 gaps; the hub portal open; a crude walk-in
  (walkAway/intoFantasy.ts: the cobbled lane, the cottages, the castle at the end of it); a placeholder end and walk-away
  with the SPELLBOOK (bedroom/, walkAway/piper.ts, 'piper' in walkAway.ts); a HUD skin per section (hudSkins/fantasy.tsx:
  fantasy, wheel, glen, tragons, keep, runway, broom, piper); ?fantasy=<checkpoint> in dev.
- (job 1) The mechanic is the enchanted staircases (stairs.ts); the user will judge it.
- (job 1) The castle monument is one painter at a size per section, never a zoom.
- (job 1) Piper's voice: two cast entries, `m2.fantasy.piper` (in person) and `m2.fantasy.piper_pa` (the same voice through
  the town's PA: radio_mild).
- (job 1) Piper's lust is for being fought over (the user's refinement): her lines purr over the violence and the
  rivalry and stay coy about the prize; the sex is what the suitors and Meathead read into it.
- (job 1) The square's staircases: the tell is 54 frames (TELL); clock staircases hold ~150-210 frames a dock and swing
  in 60-80; the Grand Staircase's last flight is a 'ride' one (40 frames on it, the tell, a 60-frame swing: a flat-out
  run up it just makes the top landing; dawdle and it swings him back down over the pier). Mandatory heights are kept
  out of a jump's reach (~150 px): the shop's roof 260, the canopy 240, the tower's wall 600.
- (job 1) The suitors drawn in suitors.ts (BRAXTON, GUNNAR, TREMAINE, and suitorOf(seed) for the crowds), each with a
  voice (`m2.fantasy.suitor_*`). After the scene he's at the wheel with a HORNY line (lines.ts).
- (job 1) Music: none; the square's set pieces will want cues (the loudspeaker's scene: something sultry under her).
- (job 2) The fairy wheel (wheel/): the wheel's geometry above (section 2 in detail); the x range unchanged. Carts are
  moving one-way ledges (each frame, before he moves; stood on one, he's carried); the wheel's frame, rim and hub are
  dimmed scenery, the gondola floors the only lit lips.
- (job 2) The roster: eight, all male, beefy (layout.ts ROSTER): CHAD (muscle tee, backwards cap), BRAXTON, SIR DEREK
  (knight cosplay), GUNNAR, WIZARD WAYNE (robe, sleeves torn off), DUANE (a powerlifter, a gut), LORENZO (a romance
  cover in a tank), TREMAINE; skins light to dark, every build. suitors.ts got three more kits for them (tee, knight,
  wizard) and legs for 'sit'. Each his own voice (five new: `m2.fantasy.suitor_chad`, `_derek`, `_wayne`, `_duane`,
  `_lorenzo`), his own cheesy lines, a name plaque under his gondola's cap.
- (job 2) What they throw (each its own hurt source and death screen): bouquets, heart boxes of chocolates, horseshoes,
  love letters tied round bricks, protein shakers, wands. A 30-frame wind-up (stood up, the thing in his hand) is the
  tell; aimed with a lead. At him if he's in range (one at a time, ~50 frames apart), else at a rival: a rival hit is
  dazed 2.5 s (stars; can't throw) and his QTE's a beat shorter and slower. Nothing's thrown before the trial's on, or
  at him while he's in a cart fight.
- (job 2) Shots bounce off them (a spark and a clink; now and then Meathead's line or the suitor's laugh). He has to
  land in the gondola: the QTE's on (qte.ts; the panel QtePanel.tsx in App.tsx, ui.qte, the real buttons live pad vs
  keys). Kinds: MASH (one face button, the meter drains), PRESS (each shown face button in turn, in time; a wrong one's a
  miss), ALTERNATE (left/right, tug of war), RING (press as the closing ring's on the band). Beats: 1 for the first
  three kills, 2 for the next three, 3 for the last two; presses up, time down as he goes; the first ever's a mash.
- (job 2) Lost: thrown out of the gondola, 46 damage (×0.65 in M2: ~30), only lethal if it takes him to zero; the suitor
  can't be fought again for 2.5 s. Won: a kill (kills.ts), round in turn shuffled: SMASH (head into the post, three
  times, left draped over the side), THROW (overhead, off the wheel, screaming, splat on the flower beds), FLOOR
  (piledriven headfirst through the floor: legs up out of it, his head out of the bowl underneath, riding round like
  that), FLING (by the ankles, round and round overhead, let go at the nearest other suitor's gondola: the body dazes
  him, then on down to the beds), CHOKE (his own bouquet down his throat a fistful at a time, purple, roses out of his
  mouth). Every one shits himself going. The announcer's call per kill; Piper purrs; Meathead's KILLED / HORNY line.
- (job 2) Falling from high on the wheel to the ground (over 430 px) hurts (its own source), not after a lost QTE.
- (job 2) The dead stay dead through his deaths (state.ts keptDead, by landVisit; the corpses where they were left);
  won for good in state.stageMemo (WHEEL_MEMO): a later visit's wheel is empty, both gates open. Starting at cp 12 (the
  checkpoint cheat) counts it won. A heart per suitor in the top band while it's on.
- (job 3, ours) The glen's theme: the park's storybook forest walk (giant toadstools, a briar patch, the storybook
  bridge out, a witch's candy cottage, a dwarf mine, a unicorn meadow under a rainbow, a dragon's lair of fiberglass
  bones), theme-park fake throughout (the bridge CLOSED FOR REFURBISHMENT, the bones' price tag, foam gold). Layout:
  section 3 in detail. Checkpoints 20-26; 27-29 spare.
- (job 3, ours) The staircases escalated: two in opposition over a gorge; one up the cottage with a cauldron swinging
  across it (and its swing-up dock into the first cauldron's arc); a chain of four, faster (110/50 against the square's
  150-210/60-80); a 'ride' one up the lair over briars while a huntsman shoots down it. Their stone mossy, lips moss-lit.
- (job 3, ours) The glen's complementary obstacles (hazards.ts): MUSHROOM TRAMPOLINES (a toadstool cap's a springy
  ledge 70 up: landing on it throws him its height (210-290 over the cap), a quarter higher holding jump; taught alone at
  a cliff, then over briars, then to a tree stand only a held bounce reaches, then up to the lair's ledge); BRIAR
  PATCHES (a thorn floor: hurt 10 and thrown up out of them; the cast get torn up and keep out); SWINGING CAULDRONS (an
  iron pot of green brew on a chain off a branch, swinging on the clock: hurt 13 and knocked; the cast too). Each its own
  hurt source and death screens (m2:fa_briars, m2:fa_cauldron).
- (job 3, ours) Five new kinds (glen/kinds.ts, all humans in costume, men and women, seeded): HUNTSMAN (a loaded
  crossbow: POINTY m2:fa_bolted; a 40-frame aim with a glint, a straight bolt; up close the stock), WITCH (a performer on
  a broom flown on wires, airborne; a cackle and a bottle up, a potion lobbed that leaves a fizzing puddle 110 frames,
  hurting him and the cast; grab: torn off her wire), GINGERBREAD MAN (runs at him, squats and shakes, leaps onto him,
  dazed on landing), DWARF (adults in dwarf costume, short; a lit candle on the miner's hat: SPIKY m2:fa_candle; rocks
  lobbed from range, the pickaxe up close, stuck after), UNICORN (a plush mascot: POINTY horn m2:fa_horn; paws and snorts
  glitter, charges, dizzy after). The square's kinds reused (clerks, knights, a princess, owls, the troll, the dragon);
  their throws fly in the glen through square/hazards.ts's exported updateThrows / drawThrows. Five new voice pairs
  (witch, ginger, dwarf, unicorn: m and f; the huntsmen use the square's cast voices).
- (job 3, ours) Piper on the PA from toadstool-capped horns at four spots (once each, a line a spot, purring over the
  fights); half the time he answers with a HORNY line; two more HORNY thoughts on his own. Once-each gags per set piece.
- (job 3, ours) THE QUEUE: three new rivals (glen/rivals.ts RIVALS: BLAKE in a tee, RAFAEL the gym prince, HANK the big
  knight cosplayer; three new voices) for the ride and the broomsticks to reuse. Not a cutscene: he keeps control; they
  speak in turn (never over each other), he answers, Piper calls trial two from the ride's horn, they go in through the
  ride's door; shots bounce off them. Gone in for good (RIVALS_MEMO in state.stageMemo).
- (job 4, ours) Truelling Tragons is side-on, the trains standing still in the world once out of the station and the
  world going by (the Wilderness train's way): layout.ts. Three lanes that never cross (the user's "not too tangly"),
  top to bottom LIGHTNING, FIRE, ICE; they spread (to 540 apart) and close to near misses (140), the camera framing all
  three always: pulled out to 0.56 as they spread, in to 1 as they close, the band under the HUD (ride.ts camTarget;
  blended in off the engine's camera at the station, back out at the unload; culled by the real view).
- (job 4, ours) HOPPING: next / previous weapon is a hop while riding (store.ts carHops / requestCarHop; App.tsx sends
  the wheel and LB / RB there instead of switching): wheel up or RB the car above, wheel down or LB the one below (by
  height: the lanes never cross, so it's always the same). A 20-frame leap (carried: no gravity, nothing to steer), a
  32-frame cooldown from leaving (0.53 s); nothing above or below: a click. His own jump still works (and down + jump
  drops through to the car under). No firing (shoot and alt fire taken off him; a NO_GUNS line if he tries, never twice
  in 45 s); melee, the charge, the grabs all work; no weapon switching (noSwitch). A controls card (the real buttons,
  live pad / keys + mouse) from the start of the first ride till his first hop (TIPS_MEMO).
- (job 4, ours) HOLES: the script breaks the track ahead (a bang, the bits falling: Piper had bolts taken out) on `his`
  lane, an `other`, or all but one (`safe`: next to his, or the far one). Warned every time: a flashing sign at the
  broken end in the lane's color (an arrow at the edge while it's off screen), a countdown bar over the dragon that'll
  run into it, its side lights flashing red, an alarm while it's his, the spiel naming the lane (SAFE: <LANE> over the
  one that makes it). Fair: 270 frames first (slow), ~210, then 140-190. A dragon that runs onto one goes over the end
  nose first with whoever's stood on it (him: the death screen's 'm2:fa_track_out'; rivals: TRACK OUT!); a spare
  dragon comes down onto the track on bat wings once it's whole again (the spiel: a replacement dragon).
- (job 4, ours) Each train its own obstacles, in waves (one on every lane at once, so whichever he's on he meets its
  kind): DUCK (FIRE a burning hoop round the track, ICE an icicle curtain off a gantry, LIGHTNING a curtain of arcs off a
  coil gantry: all at his head, under 44 clear), JUMP (FIRE a knee-high flame jet, ICE a frozen bar just over the back,
  LIGHTNING a live rail: the dragon's roof shocks whoever's stood on it, throwing them up), THROWN (FIRE a dragon tower's
  fireballs, a closing ring where they'll land; ICE a snow cannon's snowballs along the lane at chest height (duck or
  jump); LIGHTNING a storm cloud's strikes, a glowing ring first). The ICE dragon's back is frosted: stood still on it,
  he slides back (its tail stops him). Every one its own hurt and death lines; all hit the rivals too.
- (job 4, ours) The rivals (rivals.ts, kinds `m2:fa_rival_<id>`, drawn from glen/rivals.ts's looks): Blake sat on the
  FIRE dragon, Rafael on the LIGHTNING, up at their cues (or when he hits them); Hank in on the spare after the HANK
  hole. On another dragon: a wind-up and a throw at him (Blake's protein shakers, Rafael's dumbbells, Hank's turkey
  legs: their own hurt sources); after a couple, over onto his (a leap); on his: a fist cocked, a punch. Now and then they
  duck or jump a hazard; they panic-hop off a dragon that's about to go over (60%). Knocked off: all the way down
  (SPLAT!). Shots bounce off them (at the station). Dead ones stay dead this visit (keptDead; `fa-rival-dead-<id>` in
  stageMemo for the brooms); the ones that ride it out walk off at the unload, out the exit ahead of him (not kills).
- (job 4, ours) Voices: the ride's spiel, a cheesy herald (`m2.fantasy.tragons_spiel`, new); Piper on the PA; the
  rivals' glen voices. Checkpoints 30-38 (39 spare): the ride's are set as it passes them; back on one, he's on a car
  that far along (the lane in RIDE_CPS), the rivals that are up by then up on the others. One-way; the ride done is
  DONE_MEMO: a revisit's station says RIDE CLOSED (TRACK DAMAGE), no dragons running (they're parked at the unload),
  the ground walked between the station and the unload both ways.
