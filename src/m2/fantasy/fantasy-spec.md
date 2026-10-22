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
- Piper's fight (the user's, verbatim):

```
the pixie's quarters/bedroom will be extra wide. like a princess's chambers or something. what she does is leap and crash down, causing an earth quake and stuff to fall from the ceiling. the room progressively gets damaged each time she smashes, up to a limit. eventually a pipe with heat coming out of it comes loose, giving area denial for fire attacks. then she breaks open more mains and pipes that squirt liquid nitrogen open, freezing you in place, requiring you to mash buttons to escape. also loose wires in water come causing electrical damage. fire, cold and lightning damage. if she's close to these loose parts, she'll pick it up and go 'fire ball' or 'ice ball' or 'lightning bolt' and fire a projectile of those elements at you. you will have up to three areas that are unsafe to stand in in addition to random debris from the ceiling falling when she jumps and lands.

her weakness is the flintlock. fire a shot into her and a hole goes in her body, causing a disgusting mix of fat and gore to leak out as she bounces around the room. she cannot be shot as she's bouncing. cap another shot in her and another hole pops and she bounces around more. more gore and fat leaking everywhere. put in a 'deflated balloon' weakness death where she gets thinner and thinner until she looks like a supermodel, then progressively thinner until she's dangerously so and crumbles.

come up with a normal death that is fitting for a fat bitch.
```

- And: the elemental zones (the heat pipe, the liquid nitrogen, the live wires in water) DON'T hurt her (an exception to
  the hazards-hurt-enemies rule). Other weapons do normal boss damage (35% non-weakness); only the flintlock makes holes.

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
- **Piper's fight:** the user's design (above), built in job 7 (bedroom/: section 7 in detail below). Her standard death
  is ours (THE CORK), the user's to revise.
- **Music:** written (music/songs/fantasy.ts, fantasyBosses.ts; MUSIC.md has the rows): the land's theme with an
  arrangement per section, Truelling Tragons' song by the car he's on, and the fairy wheel's, the broomsticks' and
  Piper's own. cues.ts fantasyArrs / fantasyMoment / bossArrs read broom/fight.ts broomMusic and bedroom/index.ts
  piperMusic.

## The section plan (world x; checkpoints numbered across the land)

FAX = 800000. Gaps of 3000 between sections (room to grow). Every section about a fifth of the land or its time.

| # | Section | id | World x | Checkpoints | What |
|---|---|---|---|---|---|
| 1 | The town square | `square` | FAX+0 .. FAX+15000 | 0-9 | Hogsmeat Village and the storybook square; the staircases; the loudspeaker |
| 2 | The fairy wheel (trial 1) | `wheel` | FAX+18000 .. FAX+24000 | 10-12 (of 10-19) | The gigantic wheel, eight suitors in its gondolas throwing crap, the QTEs, the kills (built) |
| 3 | The enchanted glen | `glen` | FAX+27000 .. FAX+41000 | 20-26 (of 20-29) | The storybook forest: toadstools, briars, cauldrons, harder staircases, five new kinds; the ride's queue (built) |
| 4 | Truelling Tragons | `tragons` | FAX+44000 .. FAX+58000 | 30-38 (of 30-39) | The three-car coaster (fire, ice, lightning): hop cars, holes, each car's obstacles, depth, loops and corkscrews (HOLD down), survival (built) |
| 5 | The castle's base and the runway | `keep` | FAX+61000 .. FAX+73000 | 40-46 (of 40-49) | The gate, drawbridge, gatehouse, courtyard, ramparts, tower stairs, postern; the broom port (from x0+9000) and its scene (built) |
| 6 | The broomstick deathmatch (trial 3) | `broom` | FAX+76000 .. FAX+80000 | 50-51 (of 50-59) | Behind the back, mode 7, Star Fox 64's all-range mode simpler: the castle grounds, 6-8 suitors, the laser and the lock-on; in through the top window (built) |
| 7 | The bedroom and Piper | `bedroom` | FAX+83000 .. FAX+87000 | 60-61 (of 60-69) | The hall, the door kicked in, the reveal, the insult; her fight in her extra-wide chambers; both deaths; the land's end (built) |

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
  gorge); a cupid over it; the troll on the far bank.
- 5500 THE WITCH'S COTTAGE (cp 22): a swinging cauldron alone over the path (5800); the candy cottage (6300-6660, roof
  200: too tall to jump) up its staircase off the roof's corner with a cauldron swinging across the flight and another
  over the roof; the garden (a cauldron off a branch at 7000, gingerbread men, a cupid); a woodpile round the back for
  the way back up.
- 7400 THE DWARF MINE (cp 23): a team of three dwarfs by the portal; the shaft (8200-9474): a chain of four faster
  staircases (110 hold, 50 swing) between three timbered pillars (60, 120, 60 up); an owl, a cupid, a dwarf throwing
  from the far side.
- 9630 UNICORN MEADOW (cp 24): a unicorn alone; briars (10340-10860) with two toadstools over them under a huntsman's
  tree stand (300 up: a toadstool bounce with jump held gets there; a pickup); a cupid; a second unicorn.
- 11160 THE DRAGON'S LAIR (cp 25): the dragon mascot by the fiberglass skull; a toadstool up to a ledge (170), the RIDE
  staircase off it (level out over a briar floor; stood on it 30 frames, it tells and swings him up to the top landing,
  434) with a huntsman shooting down it from the top, a cupid and an owl; the lair's back wall (534) and down its far
  side's shelves.
- 13160 THE QUEUE (cp 26): a last crowd (a knight, a cupid, a gingerbread man, a princess); the rivals in the queue's
  rails (BLAKE, RAFAEL, HANK) have their say in turn, he answers, Piper calls trial two over the ride's PA, and they go
  in; the ride's door is the section's right end (on to Truelling Tragons).

### Section 4 in detail (Truelling Tragons, built: tragons/)

World x from the section's start; the ride by track position `s` (the trains stand still in the world once they're
out of the station, rears at x0+2500, and the world goes by: layout.ts wxOf). Lanes, top to bottom at the station:
LIGHTNING (yellow/purple), FIRE (red/orange), ICE (blue/white). A SURVIVAL ride (the user's rework): no suitors on it,
no guns; each track has a height and a depth along it (track.ts: drawn about one eye), with loops, corkscrews and the
helix spun on top; he hangs on.

- 0 THE LOAD STATION (cp 30): in from the queue; the hall (three dragon heads over it), NO FIREARMS ON THE DRAGONS;
  three empty dragons parked at three heights (the ICE one 70 up: hop onto any back). On one a moment and the gate
  (1360) swings open and they go (back on the platform before they're out: they stop and come back for him).
- THE RIDE (~50000 of track, 5 px a frame teaching, 6 after, 6.4 late; about two and a half minutes):
  - s 1500 THE LIFT HILL (cp 31): up to 1000 high, away into the haze (depth 0.8); the spiel, the rules (hang on in
    the loops), Piper; the first hole alone on his (a 280-frame warning, slow).
  - 5150 THE FIRST DROP: all three straight down at the camera (to 40 high, depth 1.38; braced). 5700 (cp 32) THE
    FIRST LOOP at 8100: his lane alone, slow, a 340-frame warning and the teaching card.
  - 9600 THE GAUNTLET (cp 33): duck, jump and thrower waves at the play plane; a hole. 13850 THE SECOND DROP; 15900 a
    loop on TWO lanes (his and another: hop to the third or hang on).
  - 17100 THE HEAD-ON (cp 34): LIGHTNING dives as FIRE climbs, one far (0.72) one near (1.36), through each other's
    lines; the other dragons' heads breathe across his at head height (50-frame glowing tell: duck). 20300 THE
    CORKSCREW (his). 22700 ONLY ONE SAFE.
  - 23650 THE MOUNTAIN (cp 35): up into a fake plaster mountain (snow-capped, no crater), down inside it in the dark
    (his dragons' lamps soft through it). 26300 THE CHAIN: two lanes' loops through each other (his near, the other
    far, half a loop on). The gauntlet again; ONLY ONE SAFE at 30700 and the safe lane LOOPS straight after (31600).
  - 32700 THE SPLASHDOWN (cp 36): up to 900, down into the lagoon (spray, the camera kicked). 36000 THE TRIPLE HELIX:
    all three wound round one line, two turns (no way round it). 39400 ONLY ONE SAFE (the far one); the near miss and
    its breath; 41600 a double corkscrew on two lanes.
  - 43300 THE GRAND FINALE (cp 37): 45400 three loops interlocked (far, middling, near, each 250 after the last), all
    of them. A thrower wave. The brakes; END_S 50000.
- THE UNLOAD (cp 38, set as it pulls in): a deck a lane off the dragons' fronts (stepped: drop down them), the hall,
  UNLOAD / EXIT TO THY RIGHT; BLAKE, RAFAEL and HANK in the yard (off the train ahead: Blake puking, Rafael fixing his
  hair, Hank cheering), each has his say in turn and they go out the exit; the castle's gate arch at x0+4300 (on to the
  castle's base).

### Section 5 in detail (the castle's base and the runway, built: keep/)

x from the section's start; heights up from the ground line.

- 0 THE CASTLE GATE (cp 40): in off the ride's exit; a lone CASTLE GUARD; Piper's first horn.
- 800 THE MOAT (drained, a long way down; 800-1200) and THE DRAWBRIDGE: pivots at the gatehouse's foot, 210 frames down
  (level across), the tell, 70 swinging, 210 up (41 degrees), back down. Ride it up and hop off its end onto the
  barbican's ledge (750-880, 280 up: a pickup).
- 1260 THE GATEHOUSE (cp 41 at 1340): the passage under it (ceiling 170, roof 340), veiled till he's in it; the gift shop's
  shelves; MURDER HOLES at 1700 (alone), 2080 / 2260 (a pair out of step, a guard between); a lady-in-waiting.
- 2900 THE COURTYARD (cp 42 at 3000): the PRINCESS MAKEOVER BOUTIQUE (3150-3560: the ride's survivors in its chairs);
  a jester alone at 3820; a princess, a knight, an owl; THE ROYAL ROSE GARDEN (roses 4100-4600, toadstools at 4170,
  4380 (210) and 4540 (300: the only way up the curtain wall, 300)).
- 4600 THE RAMPARTS (cp 43 at 4650, 300 up): machicolations at 4920 / 5030 / 5140 (a rolling wave, 150-frame cycle);
  THE BREACH (5300-5800): two staircases in opposition (120 held, 50 swinging) to and from a pillar (5510-5590), a
  cauldron across the far one; toadstools at the bottom (5405, 5695: 300) throw him back up; clerks casting along it.
- 6300 THE TOWER STAIRS (cp 44 at 6260, 300 up): a zigzag of three flights (100 held, 45 swinging) from the floor to
  landing B (6791, 458), C (6440-6560, 616), the gallery (6791-7540, 774); a cauldron across the middle flight, a murder
  hole over C, roses on the floor under the gallery (6900-7520), a jester and a lady on the gallery.
- 7600 THE POSTERN (cp 45 at 8420): steps down the tower's far side (130 apart: back up them too), the last crowd
  (a guard, a jester, a unicorn, a lady), the postern gate.
- 9000 THE BROOM PORT (cp 46 at 9150): the deck (stands, wind socks, broom racks, a scoreboard); the suitors left
  hovering on brooms (10050 on, 110 apart); the spare broom on its cradle (9880, 40 up); the scene from 9560.

### Section 6 in detail (the broomstick deathmatch, built: broom/)

Its own view (the side view's only a short landing for revisits: x0..x0+1400, back to the runway, on to her chambers).
The arena (world units, a suitor ~100 tall): the castle at (0, 0) (~1700 tall; her window ~1145 up), the drained moat
600-720 out, the ring paths (960, 2450), seven avenues, the gardens and fountains, the broom port's deck south (0,
-2750), the glen's forest north-west, six watchtowers (2100-3200 out), twelve banner poles, five balloons, the MAGIC
WALL at 5000 (the park beyond it: Hogsmeat's roofs, Truelling Tragons' tracks, the fairy wheel, the lake). He starts
at (0, -3700), 520 up, heading for the castle; the roster ahead of him.

- cp 50 THE DEATHMATCH (in off the runway's scene, or back here): straight up on his broom; the dead stay dead.
- cp 51 LATE ENTRIES (set as they fly in over the wall: when the first lot's down to one, or after 70 s).
- All dead: the barrier wilts, the zoom, the glass; outside her bedroom (DOORS.bedroom.start).

### Section 7 in detail (the great pixie's chambers and Piper, built: bedroom/)

x from the section's start (x0 = FAX+83000); heights up from the floor. Her bedroom's x from its left wall (R(x)).

- 0 THE HALL (cp 60 at 200, in off the glass): the castle's top floor, the smashed stained-glass window he came in by, the
  runner covered in glass, little portraits of her all along, sconces; the boss-door refill (a big health 560, a big
  ammo 650); the plaque (DO NOT DISTURB / UNLESS YOU WON); HER DOOR at 960 (tall, double, pink and gold). Naked, he's
  had a boner since the glass (hearts now and then). The camera stops at her door (her room's hidden till it's open).
- THE INTRO (up to the door, the first time this visit; a cutscene): the boot (both leaves off their hinges, flat on her
  carpet), MH_KICK; in he walks; her on her chaise (R(600)), still purring (PIPER_REVEAL); her face close up; him seeing
  her (MH_SEES: naked, it goes down in three sad sags and a sad little boing); MH_FAT, MH_UGLY; the close-up gone red,
  PIPER_ENRAGED; PIPER_FIGHT; MH_ON; on (cp 61 set: the fight's start), roses across the doorway behind him.
- 1000 HER BEDROOM (2600 wide; its ceiling 500 up; the camera's top held 540 up: no bobbing): the chaise R(600), the
  vanity and its huge mirror R(760) (her reflection), wardrobe R(1000) (a ledge, 235), the trophy wall R(1190) (CHAD's
  cap, SIR DEREK's helm, WAYNE's hat, HANK's lance, BLAKE's shaker, THADDEUS's broom) under the scoreboard (MEN WHO
  DIED FOR ME, tallied, AND COUNTING), the canopy bed R(1480) (its canopy a ledge, 205: down at the 3rd slam), wardrobe
  R(1880), the footstool R(2110) (110) up to the VIEWING BALCONY R(2220-2560) (235: the big window onto the grounds),
  chandeliers R(700) and R(1950), portraits of her. The far wall at 3600: the end of the land.
- THE WRECK (a stage a slam, six at most; looks only): 1 cracks; 2 plaster down (ceiling holes: the plumbing over it,
  the HEAT main, the LN2 lines, the water main, the FX POWER trays), the mirror cracked; 3 the wallpaper torn, the canopy
  down, the portraits askew; 4 more holes, holes in the walls; 5 a chandelier down; 6 cables hanging out of it all.

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
  crossbow: POINTY m2:fa_bolted; a 40-frame aim with a glint, a straight bolt; up close the stock), CUPID (replaced the
  witch, which is Spooky Land's: a grown cast member, man or woman, flown on wires, airborne, Piper's sour hired help;
  a diaper, a toga sash, stubby wings, a laurel or heart headband; a heart-tipped bow, the arrow always nocked out front:
  POINTY m2:fa_pricked; a 36-frame draw with a glint, a straight arrow at him (m2:fa_cupid_shot), every third draw a
  fanned volley of three; close and over him, now and then wings beating up and back, then a swoop (m2:fa_cupid); dead,
  the wings off beside it and the wire snapped; grab: torn off its wire), GINGERBREAD MAN (runs at him, squats and shakes, leaps onto him,
  dazed on landing), DWARF (adults in dwarf costume, short; a lit candle on the miner's hat: SPIKY m2:fa_candle; rocks
  lobbed from range, the pickaxe up close, stuck after), UNICORN (a plush mascot: POINTY horn m2:fa_horn; paws and snorts
  glitter, charges, dizzy after). The square's kinds reused (clerks, knights, a princess, owls, the troll, the dragon);
  their throws fly in the glen through square/hazards.ts's exported updateThrows / drawThrows. Five new voice pairs
  (cupid, ginger, dwarf, unicorn: m and f; the huntsmen use the square's cast voices).
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
- (job 5, ours) The castle's base (keep/): theme-park castle throughout (fiberglass stone, a drained moat DRAINED FOR
  CLEANING, YE OLDE GIFT SHOPPE in the gatehouse, the PRINCESS MAKEOVER BOUTIQUE, the royal rose garden, a broom port).
  Layout: section 5 in detail. Checkpoints 40-46; 47-49 spare. No big refill here (the boss door's in the bedroom).
- (job 5, ours) The monument hands over: the keep's sky has no castle on a crag (fairySky with none); the same painter
  (drawCastleAt) close up at 2.8 inside the walls (the keep and the spire towering, its foot out of the picture) and
  2.4 on the runway (the keep beside the deck, PIPER_WINDOW lit right up over it). MONUMENT_AT.keep goes unused.
- (job 5, ours) Two new twists, each taught alone first: THE DRAWBRIDGE (a StairDef to stairs.ts, drawn as a bridge:
  down / tell / up on the clock; ride it up for the barbican's pickup) and THE MURDER HOLES (hazards.ts: quiet, a 50-frame
  tell (the hole glows orange, steam, drips, a gurgle), a 56-frame pour of boiling butter brew straight down; 14 damage,
  source m2:fa_oil; the cast too, and they keep out). Then built on: a pair, a rolling wave of three along the wall walk,
  one over a tower landing. The glen's toadstools (planters), briars (as ROSE BEDS, m2:fa_roses) and cauldrons reused.
- (job 5, ours) The staircases at their hardest: the breach's two in opposition (120/50, a cauldron across one, a
  toadstool recovery under it); the tower's zigzag of three (100/45) with a cauldron across the middle flight, a pour over
  the landing between, thorns under the top one, a jester throwing down from the gallery.
- (job 5, ours) Three new kinds (keep/kinds.ts, costumed, men and women, seeded): CASTLE GUARD (a halberd: POINTY
  m2:fa_halberd; levels it with a stamp (30 frames) and lunges; jumped over, chops up at him; winded after), COURT
  JESTER (juggles all the time; faster and higher (34 frames), then all three pins thrown in a spread; up close a
  bladder-on-a-stick bonk and a cartwheel away), LADY-IN-WAITING (the costume dept's only got the gown and the cone hat:
  men wear it too; fans herself hard (30 frames), throws her fan flat: out and back to her hand like a boomerang, hits
  both ways, no second throw till it's back; up close a slap). With the square's knights, princesses, clerks, owls and
  the glen's unicorn. Kill callouts, hurt and death lines for every new hurt. Guards use the cast voices; jester and
  courtier pairs new.
- (job 5, ours) The suitors who lived through the ride (no `fa-rival-dead-<id>`) are at the PRINCESS MAKEOVER BOUTIQUE
  as he passes (behind its window, in the chairs, tiaras and face masks): each has his say in turn, he answers (once a
  visit); none left: he has a line about it. They keep the tiaras on for the runway.
- (job 5, ours) THE RUNWAY'S SCENE (runway.ts; a cutscene: HUD hidden, no input, SKIP >> for the lot): the suitors left
  hover on brooms over the deck: the ride's survivors plus THE FASTPASS BOYS (who paid to skip trials one and two, so
  there's always somebody to fight: CHET (tee), THADDEUS (wizard, a convention broom flyer), DMITRI (cape); three new
  voices). He walks up to the spare broom; the chime; Piper (the PA): the final trial, the rules (last man flying gets
  her window, the highest one); up to two survivors and one FASTPASS boy trash-talk (in turn); he hops on the broom
  (stood on it), it lifts, hearts, his MOUNT line (blunt, horny); Piper: go; they all shoot off up into the sky one after
  another, him with them; black; DOORS.broom.start. For job 6: who flew is `fa-broom-roster` in state.stageMemo
  (ids comma-separated; the looks: glen/rivals.ts RIVALS and keep/runway.ts FASTPASS). Done for good (`fa-keep-runway`):
  a revisit's deck is empty (racks bare, NO FLIGHTS TODAY, the boutique's chairs empty) and the right end walks on.
- (job 6, the user's) The broomstick deathmatch is modeled on STAR FOX 64's ALL-RANGE MODE (Fortuna, Katina, Sector
  Z: the camera behind him, a bounded open arena round a central landmark, a forced U-turn at its edge, the suitors
  dogfighting round the castle, the radar, everybody arrowed and marked, the charged lock-on homing shot), but simpler:
  no wingmen, no somersault, no bombs.
- (job 6, the user's) Controls: the d-pad / stick's up and down PITCH UP / DOWN, left and right TURN; Y or alternate
  fire toggles inverted pitch (ours: NOT inverted to start, up climbs; the plate bottom left says which, a flash says
  so; kept as he left it). A (jump) BOOSTS (Star Fox's: a burst, a short meter, used up it refills before it'll go
  again); B (the game's boost button) BRAKES, held. That swap is deliberate. On a NINTENDO pad (Pro Controller, Joy-Con:
  device.ts padFamily) boost and brake swap (an exception to positional buttons: the jump spot brakes, the B spot
  boosts); keyboard and other pads unchanged; the controls card shows the right icons per family. And on every pad
  (the user's) LB and LT brake too, RB and RT boost too (RT doesn't fire here: X does; a lone Joy-Con has no triggers).
  The pause menu shows the broom's controls in place of the weapons (PauseControls.tsx).
- (job 6, the user's) Hitting the arena's edge (the park's MAGIC WALL, 5000 out) FORCES A TURNAROUND: he's swung round
  back in (64 frames, his controls off, no damage), TURNING BACK, a line now and then.
- (job 6, the user's) X fires the LASER on the broom's END (an emitter clamped on its tip, the pink lens): a tap is the
  laser (unlimited; a little aim help toward whoever's nearest the middle, a pink bracket on him). HOLDING X is the Star
  Fox lock-on: past 12 frames the reticle charges (sweeps round and grows, the lens glowing), and 26 more it snaps RED
  onto the suitor ahead (LOCKED, a tone); let go locked and it's a HOMING shot (5 times a laser's damage); let go
  without a lock, just the laser. On the controls card (HOLD X).
- (job 6, ours) The arena (section 6 in detail): the castle grounds on one mode 7 texture (1024 px, 12 units a texel,
  two averaged copies for the far rows, the hour multiplied in), sampled a row at a time into 400x300 and blown up 2x,
  rolled a little with his bank; the haze stepped toward the horizon; the sky banded, the far hills and clouds a ring
  that turns with his heading; everything else billboards scaled by depth and culled by the eye (the castle is
  monument.ts's painter, at 2x, 3.6 units a px; towers, trees, banner poles, balloons). Solid: the castle (560 wide to
  480 up, 300 to 1180, 90 to 1650) and the towers (110 to 900, 60 to 1250): fly into one and it bounces him off,
  12 damage (m2:fa_bb_tower). Balloons boing him off, harmless. Trees are scenery. Skimming the lawn's fine (40 up).
- (job 6, ours) The suitors: the runway's roster (`fa-broom-roster`; the FASTPASS three if it's missing) and the LATE
  ENTRIES (new, paid cash at the gate: BRODY in a tee, SVEN the viking, SEBASTIAN the prince; three new voices), enough
  to make 6 to 8. Each his own way: BLAKE flanks and throws protein shakers; RAFAEL hunts the other suitors first and
  throws dumbbells; HANK charges (a glint, the broom dipped, a straight ram: his foam lance) and throws turkey legs
  between; CHET flanks with a gift-shop wand's three-bolt bursts; THADDEUS (the convention flyer) and SEBASTIAN snipe
  (keep away, a 52-frame charge, one fast bolt); DMITRI and SVEN charge and shoot; BRODY hunts. They fight each other as
  much as him (hit one and he wants you back). Out of his way too long (3400 off for 7 s), they come at him: nobody's
  ever lost. Names and health over the near ones, a diamond over the far, arrows in from the edges, the radar (heading
  up, up / down marks), an altimeter, the suitors' bar along the top band. Shot down: a spiral, a scream and a shit,
  into the tower or castle wall he was by (a smear down it), the lawn, or the moat's mud (GROUNDED!, WALL ART!, MUD
  BATH!, FRIENDLY FIRE!); they lie where they fell. Piper on the PA purrs over the kills; fireworks over the grounds.
  Their throws and bolts: their own hurt sources and death screens. Theirs to him: bolt 8, burst 6, snipe 13, shaker 10,
  dumbbell 12, turkey 10, ram 18 (M2's x0.65 on all).
- (job 6, ours) A sub-boss (markBossFight 'broomsticks', quiet: no music yet). Checkpoints 50 (the start) and 51 (the
  late entries in); the dead stay dead through his deaths this visit; won for good (`fa-broom-done` in stageMemo): a
  revisit's side view is a landing high on the castle (CONCLUDED. NO SURVIVORS.), back to the runway, on to her chambers.
- (job 6, ours) Naked: the BONER on the broom, from behind: out past his hip on the outside of the turn, further the
  harder he banks (the balls between his thighs too); a boing and hearts when the barrier drops.
- (job 6, ours) The end (a cutscene: HUD hidden, no input, SKIP >> for the lot, skipped straight to the bedroom): the
  last one's down; Piper (her window's open), his line; the rose barrier on her window wilts (petals); autopilot round
  to the castle; the cut, square on the window, and the RAPID ZOOM (the focal length shooting up 46 times in 80
  frames) with him flying off into it, smaller and smaller; the SMASH: the view's caught, he's put at
  DOORS.bedroom.start (glass bits round him), and the glass breaks over the new scene: cracks spreading out from the
  window's middle, then ~100 radial shards flying apart (out and toward us, spinning, falling, glinting), the bedroom
  showing through (index.ts ticks and draws it: broom/fight.ts tickShatter / drawShatter). The bedroom's boner (and its
  going flaccid) is job 7's.
- (job 7, ours) The section's x range is unchanged (FAX+83000..87000 holds the hall and a 2600-wide room). The hall,
  the door and the room: section 7 in detail. The boner: render/player/body.ts got setErect(k, frame) (0 hanging .. 1 a
  full boner, up and out the front; unset a few frames, it's hanging again): up in the hall from the glass on, down at
  the sight of her (three sags and a sad boing), back up hopeful at the supermodel, down again past it.
- (job 7, ours) Her: 666 HP; the ray gun and his moves in full, anything else 35%, the 60-frame breather (Steve's way;
  the enemy `m2:piper` a mid-boss: no instant kills, no status effects). Phases by thirds: the waddle 1.3 / 1.6 / 1.95
  px a frame, 150-210 / 110-170 / 80-130 frames of it between slams. Her belly bumps him (10). Grab her: too much of
  her (GRAB_PIPER).
- (job 7, ours) THE SLAM: a 46-frame crouch (squashing down, her wings buzzing, half the time a shout), up 30 frames to
  200 under the ceiling, 36 frames hanging there tracking him (7 px a frame) with her shadow growing on the floor under
  her, a 14-frame lock (the shadow red, a beep), down (about 15 frames). Under her: 22. THE EARTHQUAKE (fair: the jump
  beats it): stood on anything (floor or furniture) when she lands, he's knocked off his feet 26 frames (a hop, stars,
  no hurt); in the air, nothing. DEBRIS: 2 + the stage (6 at most), one at him, the rest about the room at least 110
  apart; 56 frames of dust trickling and a shadow growing (a red ring blinking) on whatever it'll land on (the floor or
  the furniture's tops), then it drops: 11. Rubble left about (looks only). She sits 60 / 50 / 40 frames after.
- (job 7, ours) THE MAINS (unlocked by slams, the user's order; each comes loose where she landed, kept 420 apart and 260
  off the walls; three unsafe areas at most; NONE OF THEM HURT HER):
  2nd: the HEAT PIPE (the heat main's end hanging out of a ceiling hole): quiet 130 (a wisp), tell 60 (steam roaring, an
  orange glow at its end, a hiss), on 110 (a column of fire to the floor, 68 wide, burning 128 wide along the carpet):
  13, thrown off it. 4th: the LIQUID NITROGEN main (burst out of a hole low in the back wall): quiet 120, tell 60 (frost
  spreading on the wall, a sputter), on 100 (a white jet along the floor, 230 long, 64 high, the way it faces flipping
  each time): FROZEN in a block of ice (8): MASH any button (jump, fire, the special, secondary, the charge: 0.11 a press,
  draining 0.0035 a frame; out on his own after 260 frames), the panel up with the real buttons (bedroom/IcePanel.tsx,
  ui.iceMash; its cracks spread over the block as he goes). 6th: the water main and the FX POWER: a flooded patch on
  the floor (260 wide), the cable down into it: quiet 110 (a spark now and then), tell 50 (sparks crackling over the
  water), on 100 (arcs all over it): feet in it, 14 and a jolt up. The 5th slam brings the chandelier nearer him down:
  70 frames swinging, its chain spitting sparks, creaking, its shadow (a red ring); then it falls: 24.
- (job 7, ours) HER THROWS: walking within 170 of a loose part, at most every 6 s, with nobody talking (the shout must be
  heard), she stoops 36 frames and rips a bit off it, shouting (her voice) "FIRE BALL!" / "ICE BALL!" / "LIGHTNING BOLT!"
  (the user's words), then throws: the FIRE BALL lobbed to land where he's headed (12; a fire burning 80 frames where it
  lands); the ICE BALL straight at him (6 and frozen: the mash); the LIGHTNING BOLT a flickering aim line off the cable's
  end for 24 frames, then the bolt down it 10 frames (14, a jolt).
- (job 7, ours) THE FLINTLOCK (the user's opt-in to its holes; still no headshot): a ball in her (breather or no, any
  time she's not bouncing) is a HOLE (150, the ball's own boss hit, as its number says), fat and gore out of it, and
  she's off round the room like a let-go balloon for 150 + 30 a hole frames (10 px a frame and a px more a hole,
  wandering, off the walls and the ceiling with a boing; touching her 14; out of the enemy list: nothing can hit her),
  leaking fat and gore (the carpet and the walls get the splats: looks only, it's no slicker: the floor's busy enough),
  then down on her face, up, and on, a bit thinner each hole (thin 0.18 a hole). The fourth hole kills her (the
  deflated balloon). Her bar shows the holes. The hint (him thinking out loud about the flintlock) only if he's got it.
- (job 7, ours) Her two deaths, both a cutscene (no input, SKIP >> for the lot), the letterbox up: THE CORK (any other
  way): "ONE LAST BELLY FLOP!", up and down through the wrecked floor; wedged to the waist (the boards splintered round
  her, her legs kicking in a cutaway of the room below, the wings buzzing), PIPER_STUCK; the pressure (170 frames and
  quiet: the rumble quicker, steam out of the cracks, her shaking, shocked) and MH_PRESSURE; POP (a boom and a boing):
  straight up through her ceiling and the roof, a hole left in it, the mains gushing up out of the floor after her like
  champagne, a brown streak behind her (she shits herself going) and the turd back down through the hole a moment
  later, the scream (PIPER_POP); a beat; a distant thud; fairy dust drifting down through the hole; MH_WON. THE DEFLATED
  BALLOON (the fourth hole; the kill cam, slow, pushed in): round the room one last time farting like a let-go
  balloon, down on her feet, the hiss: down to a SUPERMODEL (thin 1: a waist, a jaw, no chins, the gown fitting her),
  sparkles, PIPER_SUPERMODEL; MH_SUPERMODEL (naked: it's back up, hearts, a boing); then on down (thin to 2: gray, the
  cheeks hollow, ribs, the gown hanging off her), PIPER_TOO_THIN, MH_TOO_THIN (naked: down again); PIPER_CRUMBLE; she
  crumbles to a heap (the gown in a puddle, bones, the beehive flat with the tiara in it, dust); MH_WON_WEAK. piper.ts
  got `thin` (0 .. 1 the supermodel .. 2 the bones) on drawPiper and piperBodyW.
- (job 7, ours) Lines (bedroom/lines.ts): clean / shitty / naked pools for every group, his and hers, intro to death;
  hers in person (`m2.fantasy.piper`). New hurts, each its voiced hurts and death screens (and its death: burnt, frozen,
  fried, flattened): the heat pipe, the nitrogen, the live water, the fire ball, the ice ball, the lightning bolt, the
  debris, the chandelier, her slam, her bouncing, her belly.
- (job 7, ours) Checkpoints: 60 in the hall (the refill there), 61 the fight's start (manual: set as it starts; nobody
  else about). The intro once a visit: a retry (or a start past the door) finds the door down and her waiting in the
  middle of the room (an entrance beat of 100 frames, PIPER_AGAIN, MH_AGAIN). The room's wreck, the mains and her holes
  go with her on a retry (she's whole again). markBossFight 'piper' (no music yet). Beaten: VICTORY, the walk-away
  (walkAway/piper.ts, the SPELLBOOK: no longer a placeholder; the cork leaves a hole steaming in the castle's roof, the
  balloon a greasy streak down from her window and drips down the lane), markLandCleared('fantasy'), the hub. How she
  died is `fa-piper-end` in state.stageMemo (`cork:<x>` / `balloon:<x>`): a revisit's room is wrecked and empty (the
  canopy down, a chandelier down, the hole in her ceiling and the floor she was wedged in, or the heap), the door down,
  no refill, the way back out the hall.
- (music job) The land's theme "Once Upon a Line" (a storybook 6/8, F-sharp major, 114) re-orchestrated per section
  (the loudspeaker's scene and the broom port's play their own arrangements, not the cutscene mix); "O Fortuna, Times
  Three" for Truelling Tragons (B-flat minor, 174, 3/4: the station, the lift hill, then the lead by the car he's on);
  "Pick Me! Pick Me!" for the fairy wheel (a 60s dating-game bounce, F, 140; the QTEs get the think music); "Last Man
  Flying" for the broomsticks (Star Fox 64 meets a John Williams flying theme, C, 156; louder for the late entries,
  the theme alone for the window); "It Ain't Over" for Piper (a symphonic-metal rage aria, E-flat minor, 136: purring
  for the intro, a ticking clock while he sizes her up, ENRAGED on, a theremin and slide whistle while she's a let-go
  balloon, her music box for her deaths).
- (the user's, Truelling Tragons rework) Verbatim: "no suitors are fought on the dragon ride. throw in elements of
  crazy depth and height changes like the toilet ride in hollywood land. when a loop is coming, you gotta hold down on
  the handlebars to hold in place when it goes through a loop so you don't fall and die. make sure the player knows
  about this. which track gets the loops and what button they need to press "down". you hold on the bars of the ride
  and swing wildly. you don't have control over your guy during the big loops, corkscrews. sometimes tracks loop and
  corkscrew into each other. make it cooler. this is less a 'fight' ride and more a 'survival' ride. adjust dialogue
  accordingly." Then: "no gun use here. put in special poses for these parts"; "you don't slip on the ice dragon
  automatically"; "the lightning train loses a gap when the other trains don't have a gap"; "put in a special death
  animation based on the track (3 of them) if you fall off while riding the dragon off the edge". This supersedes the
  job 4 entries above where they differ (the rivals on the ride, the lanes never crossing, the ICE dragon's slide).
- (rework, ours) NO SUITORS on the ride: rivals.ts's AI, throws, hops and punches gone with their hurt sources; BLAKE,
  RAFAEL and HANK rode the train ahead and all three live (no `fa-rival-dead-*` from the ride: keep/runway.ts's
  survivors() gets all three, so the boutique and the broom roster do). Glimpsed at the unload: in the yard, each has
  his say at him in turn (RIVAL_UNLOAD, their glen voices), then out the exit. The station's three dragons are empty
  (board any). Checkpoints renamed along the new layout: 31 THE LIFT HILL, 32 THE FIRST LOOP, 33 THE GAUNTLET, 34 THE
  HEAD-ON, 35 THE MOUNTAIN, 36 THE SPLASHDOWN, 37 THE GRAND FINALE (none inside a loop's warning); 30 and 38 as before.
- (rework, ours) DEPTH (track.ts, the toilet coaster's way): each lane's height and depth keyed along the ride
  (layout.ts H_KEYS / D_KEYS), every point drawn at its depth about the scene's one eye (the trains' middle); the cars
  laid along the track a car's length of track apart (through a loop they stay a car apart), turned along it, scaled
  with depth, squashed through a roll. The ride's physics stands him on the same projected roofs (the roof block under
  his x: the roof's height wherever he walks, jumps or lands), and he's drawn at his dragon's depth (spriteScale).
  Drawing far to near: what's nearer than his dragon goes over him. Lift hills go away (0.8), drops dive in (1.3-1.4),
  the head-on passes one far and one near. Obstacles only where the tracks are at the play plane. The camera keeps
  all three (the cars and the loops' swing) under the HUD and over the loop card, out to 0.42; kicks on the drops, the
  loops and the splash.
- (rework, ours) THE LOOPS: the script's `spin`s resolve as their warning starts onto `his` lane, `two` (his and one
  more), `all`, or `safe` (the lane the last ONLY ONE SAFE left whole). Kinds: a loop (a real side-view loop: the track
  swings round a circle on top of the ride's pace, faster through the bottom), a corkscrew (round a line, in toward the
  viewer and away, the train rolled over), the chain (two loops through each other, one near one far), the triple helix
  (all three round one line a third of a turn apart), the finale (three loops at three depths). His car going into one
  (or a car steeper than 0.42 rad: a drop, braced) and he's LOCKED: carried at his place along it, turned and rolled
  with it, no control, no hopping (and no hopping onto a dragon in one). Through a loop he must HOLD down: let go and his
  grip slips (5 frames: the slip pose, a SLIP line) and at 16 he's flung off the way the car was going, flailing all
  the way down (the camera with him; the roofs taken away so nothing catches him): 'm2:fa_flung', the splat. Warned
  every time: a round sign in the lane's color with the loop drawn on it at the loop's start on its track (an arrow at
  the edge while it's off screen), a countdown bar over each dragon going in (LIGHTNING LOOP etc.), the spiel naming
  the track(s) (two: naming the one that runs straight), and the card at the bottom of the screen (App.tsx tragonHold:
  "LOOP ON FIRE TRACK: HOLD [down]", the real button live pad / keys; YOURS! when it's his; in it, HOLD [down] TO HANG
  ON!, red when slipping). The first loop is his lane alone, slow, with a long warning and the teaching card ("A LOOP:
  HOLD [down] TO HANG ON / ON THE <LANE> TRACK. LET GO AND YOU FALL. HOP OFF IT TO DODGE IT"; LOOP_MEMO once he's been
  through one). Escalates: two lanes, a corkscrew, the chain, a loop straight after the hop, the helix, a double
  corkscrew on two, the finale on all three.
- (rework, ours) POSES (the user's "no gun use here. put in special poses"): Player.tragon, render/player/tragonPose.ts:
  crouched on the dragon's back gripping its grab rail (shuffling along it: 2.2 px a frame at most), flat on his belly
  (duck), tucked (jump), spread-eagled (the hop), braced on the drops (leaning back, eyes wide), and in the loops hung
  off the rail by his fists with the rest of him swung round it the way gravity has him (hanging upside down at the top,
  laid back along the roof at the bottom, legs flailing, white knuckles, a grimace), one hand torn off when slipping;
  no gun drawn at all; the flung fall is the freefall flail. No charge, slide, uppercut or dive kick on the ride either
  (noSpecials): hop, duck, jump, survive.
- (rework, the user's) The ICE dragon's frosted roof no longer slides him back: "you don't slip on the ice dragon
  automatically". Ice matters only through its own obstacles (the icicles, the frozen bar, the snow cannon).
- (rework, the user's report) A lone hole: always on his lane (no `other` holes now), always told (the spiel names the
  track; the sign, the countdown over the dragon, its red lights and the alarm), the signs and countdowns kept under the
  HUD and inside the framed band whichever lane (the top one included), at least ~200 frames of warning.
- (rework, the user's) A death for each track's broken end (deaths.ts, own death kinds, voiced hurt and death lines):
  FIRE, nose first into a wall of its own flames, a fireball, charred black still gripping the rail, crumbling to ash
  but for his two fists; ICE, thrown off the front frosting over onto a frozen pond and burst into chunks that skate
  off, his head in a cube of ice the farthest; LIGHTNING, nose into the broken live rail's end, his skeleton flashing,
  hair on end, black and smoking, then over the end and down out of the shot. The long fall (flung, or off a dragon):
  face down in the lawn, spread-eagled, a leg twitching, his lost boot landing on his butt.
- (rework, ours) Set pieces: the head-on and the late near miss breathe (the other dragons' heads at his: fire,
  frost, lightning by dragon; 'm2:fa_breath'); the fake mountain (dark inside, the lamps soft through it: drawn in screen
  space); the splashdown (the lagoon, the spray); the drops (his DROP scream, the camera kick). Dialogue all survival:
  his terror and swearing (drops, loops, corkscrews, the helix, the slip, the dark, the splash: clean / shitty / naked,
  pickLine, never twice in 45 s), the spiel naming the track that loops, Piper purring at him letting go. The music:
  in a loop, the arrangement with all three cars (`main`).
- (the user's, broomsticks) Verbatim: "adjust meathead's pose on the broomstick. make it look like he's actually riding
  one. on the side view and the shooting view"; "make sure the mode 7 fight looks bloodier. when you win, meathead
  flies in circles around the castle before eventually flying into the window. i want to see big blood splatter on the
  ground with the dead bodies as you kill more people during the broomstick part". Supersedes "stood on it" above.
- (broomsticks, ours) RIDING: from behind (broom/art.ts drawMeatheadBroom) he's sat astride the shaft, the shaft
  between his legs off ahead to the laser on its tip, both fists on it ahead of him (over his head's line), elbows out,
  knees out and bent, his boots tucked back by the binding (soles at us), the bristles fanned under him; the whole rig
  leans into a turn, climbing tilts the tip up and sits him back, a boost tucks him low (head down, hair whipping), a
  brake sits him up with his fists pulled in to his chest. Naked: the balls over the shaft, the boner out past the hip
  on the outside of the turn. Side on (the runway's mount and takeoff): Player.broomRide (render/player/broomPose.ts,
  tragonPose.ts's drawFig): sat on the shaft, knees forward, boots back toward the bristles, fists on it ahead, leaning
  more as it shoots off; naked, the balls hung over the shaft and the boner laid along it. The suitors ride the same
  way (suitors.ts 'ride': straddling, leaned forward, both fists on the shaft; the runway's and the deathmatch's).
- (broomsticks, ours) BLOOD: every hit on a suitor sprays (out the way the shot was going, some back, a puff of mist;
  bigger the harder the hit), all in the world and scaled by depth; a kill bursts him (a cloud of blood, mist, chunks
  of him and bone raining down onto the grounds); his death spiral leaves a trail of blood hanging in the air; a wall
  hit bursts again and leaves a smear with spatter and drips. Him hit: blood off his back at us (screen space with his
  figure). Up to 900 bits in the air (the oldest go).
- (broomsticks, ours) THE SPLATTERS: each suitor down lies in a BIG SPLATTER (broom/arena.ts setSplats / paintSplat),
  painted into the mode 7 ground texture where he hit (only its patch of the copies remade: no sprites, no cost however
  many): a lumpy wet core (~250 units across), spikes all round, long streaks and drops thrown the way he was going (out
  from the wall he slid down), spatter, gore bits; in the moat's mud, darker. They pile up and stay for the visit
  (`splats` in the kept state: through his deaths; anybody still falling when he died is down where he was); his body
  on its snapped broom lies in it. The revisit's side view is a landing high on the castle (no grounds in it).
- (broomsticks, ours) THE VICTORY LAP (a cutscene: HUD hidden, no input, SKIP >> to the bedroom as before): the last
  one down, Piper and his lines as before and the barrier wilting while he flies circles round the castle on autopilot
  (two laps the way he was already going, spiraling in to 1350 out and up to 200 over her window, past the towers'
  tops), the camera swung out behind him and up (looking in at the castle and down at the bloody grounds; him drawn
  where it has him, by his depth), Piper's fireworks faster; laps done and the talking over, he breaks off at the top,
  banks in for her window (the camera back in behind him), then the cut and the rapid zoom and the glass as before.
- (SNES pass, the town square) One eye over the scene; the land's SNES kit in kit.ts (six-step material ramps: plaster,
  timber, slate, snow, cobble, flag, stone, brick, iron, gold, gingerbread, icing, pine, the lit lip; hour / dimmed
  tints; still / stillAt / seen / sideBack / topBack / snowCap; FRONT_D 0.86, BACK_D 0.76): later sections use it.
  The far off cached per hour (square/far.ts: banded sky, stepped cumulus, the Alps (no volcanoes), the castle up on
  the far hills clear of the roofs, the park beyond (the fairy wheel, Truelling Tragons' three tracks, turrets, the iced
  lake), Hogsmeat's roofs with smoking chimneys, far snow). The fronts at FRONT_D with real sides and snowy roof slopes
  running back (square/fronts.ts: Hogsmeat half-timber with goods in glowing bays, storybook cottages, gingerbread, the
  station, the park hedge and the fairy wheel gate), the pavement and back alley, street furniture on the pavement. The
  play plane (square/art.ts): bent cobbles, the train back on its track bed, the cart, WANDS & SONS / the pillar / the
  columns / the far wall with sides and tops going back, the carousel's drums, the gorge as a chasm going back (cliff
  faces, frozen falls, clouds below), the tower's hall (portraits' eyes follow him, torches), the bandstand; balconies
  on brackets under 200 high, enchanted floating slabs above. Enemies redrawn (mascots lie down properly dead: the old
  rotate-to-lie sank them into the cobbles), snow hazards and throws, the staircases, the suitors (stepped shading,
  same looks), the castle (more spires, banners, a road up its crag), the loudspeaker (letterbox framing) and the
  walk-in. Drawing only: no layout, timing or hitbox changes.
- (SNES pass, the fairy wheel) The user: "the fairy wheel is lacking in detail in the background". The camera climbs
  1300 px, so the far off (wheel/far.ts, every layer a tile cached per hour) slides down by nearness as he climbs: the
  banded sky, cirrus and cumulus at three heights (the tallest only from up the wheel), birds by day / fireworks after
  dark, balloons got away, the square's Alps (exported from square/far.ts), the castle, the park (the glen's forest,
  Tragons' tracks and station, teacups, flying pixies, Hogsmeat's roofs and steeple, turrets, the frozen lake with
  skaters), and the fairground's rides standing up over the near stalls (a big top, THE WAND drop tower with its seats
  going up and dropping, the helter-skelter, the swing ride's chairs flying round, the galleon swing, the dark ride's
  castle front, the gift shop turret, flag masts, bunting slung between the tops, lit trees, crowds). Round the play
  plane (wheel/fair.ts, one eye): the plaza's flags going back, the hedge with topiary and the trees at 0.72, the
  midway at 0.8 with sides going back (game booths with plush, food stalls with their wares big on the roofs, MADAME
  FAE's tent, the strongman's bell, gift shops, the wheel's BOARD HERE pavilion behind its feet), and at 0.92 lamp
  posts with fairy lights strung between, seeded crowds behind rope rails (bobbing, cheering), topiary, benches, candy
  carts, and the fountain (Piper in bronze, water live); the paving bent, its kerb lit. The wheel (art.ts): lattice
  truss A-frame on stone plinths (a stamp), stepped rims laced between, braced spokes, gilt bosses, two rings of
  pixie lights with halos after dark, a two-tier flower hub with a heart gem, the PA horn in stepped brass; the
  gondolas stamped (petal backs, tufted benches, banded spotted toadstool caps with frilled gills, gilt plaques) with
  veined wings and twinkling lights live; floors' warm lips; the kiosk, the velvet-rope queue, the flower beds, the
  gate posts and rose gates; the throws redrawn. The kills got impact bursts, sweat, teeth, speed lines and a splat on
  the beds; the QTE panel dressed as a gondola (cap, fairy lights, gilt plaque, hearts for steps, banded fills);
  fall_wheel's kill cam got clouds and a far skyline (Alps, castle, fairground tops). The plaza's lanterns, stalls and
  the wheel's rim light the night (lamps). Drawing only.
- (SNES pass, the enchanted glen) The glen's enchanted: green and in flower in the middle of the snow (the winter's all
  round it far off). The far off (glen/far.ts, every layer a tile cached per hour): the banded sky and stepped cumulus,
  the square's Alps, the castle (its foot lost in the treetops, more of it in the meadow's clearing), the park beyond
  (snowy hills, the fairy wheel he came from, Hogsmeat's steeple and clock tower, Rapunzel's tower and braid, the
  beanstalk up into its cloud and the giant's castle, a windmill, Tragons' tracks and station, turrets), the storybook
  forest's far edge (oaks, blossom, lilac, frosted pines, spire trees; a thatched cottage in a clearing, a dark ride's
  crooked front), the near forest as a colonnade of trunks (fairy doors, fungi, ivy, lanterns strung, toadstools; the
  canopy only seen from up the lair's staircase); fireflies after dark, motes by day. Round the play plane (one eye;
  glen/paint.ts, art.ts, sets.ts): the forest floor going back (a trodden path, moss in bands, flowers), the giants at
  0.8 (roots, bark in steps, moss, ivy, fairy doors lit, owl hollows, carved hearts, boughs; their trunks stamp over
  stamp out of the picture) with fairy lights strung between (twinkling), undergrowth at 0.85 in 480 px stretches each
  with a find (a stump house, a gnome, a crowned frog, a picnic basket, a glass slipper, a nest, a boot house; ore and
  crates in the mine's yard, foam rubble and gold in the lair), props at 0.93 (lanterns, a wishing well, a frog-prince
  fountain, a spinning wheel roped off, log benches, a pumpkin coach, a shoe house, cookie gravestones, signposts); the
  near floor bent. Set pieces: the gate of twisted branches and its lanterns; the cliff's strata and moss cap (lit), its
  spring running into a pool; the bridge's gorge going back (misty depths, a waterfall pouring, clouds below), its
  faces, newels and cut rope rails, dangling planks, sawhorses and a wheelbarrow, the pier with its broken springers;
  the cottage in gingerbread steps (sides going back, its frosted top lit, a bite out of a wall, a peppermint chimney
  smoking); the oaks (the first two cauldrons share one, so no trunk stands inside the cottage) and their limbs out to
  the cauldrons' branches; the woodpile; the mine's hill and portal (the inside dark: never seen), rails, the gem cart,
  the buffer, the head frame (its wheel turning, a bucket going up and down the shaft), the shaft (cribbing, ladders,
  lanterns) and its timbered pillars; the meadow's clearing (round trees, a hedge, a plywood rainbow on cloud plinths
  with bulbs lit after dark, a picket fence, unicorn photo boards) and the tree stand; the lair in fiberglass (back wall
  panels bolted, stalactites, crystals glowing, a staff door, torches), its mouth's pillars and arch, the ribs, the
  skull with its $4,999 tag, the foam gold round a chest; Truelling Tragons' front (turret, banners, arrow slits, the
  three heads breathing, the gilt name, the portcullis up), its tracks and a train over it, the crowd behind velvet
  ropes. Toadstools, briars, cauldrons (and the branch they hang off), bolts and the dwarfs' amethyst redrawn in steps;
  the cast: the huntsman's capelet, laced jerkin, bracer, boot cuffs, quiver and walnut crossbow; the dwarf's hood,
  buckle, stranded beard, putty nose, brass helmet and dripping candle; Cupid, the cookie and the unicorn in stepped
  parts and stamped frames (same looks). Drawing only: no layout, timing or hitbox changes.
- (SNES pass, Truelling Tragons) One eye for the whole scene (tragons/scene.ts sceneEye: the ride's own, the trains'
  middle, while the camera's the ride's; the engine camera's at the station and on the revisit's walk, blended) and the
  park's own coordinates under the ride (a thing at park x P is at P - scroll; the track's s at S0X + s). The far off
  (tragons/far.ts, every layer a tile cached per hour) has its horizon at the eye, its layers standing at their depths
  between it and the park round the ride (climbing spreads them down the picture, the drops close them up; zoomed out,
  a little smaller; their slide summed frame to frame so a zoom never swings them): the banded sky, clouds at four
  heights (the cirrus and tall cumulus only once the ride climbs), birds / fireworks, balloons, snow; the Alps; the
  castle; the glen's park beyond (exported from glen/far.ts, with its forest edge); the rest of Truelling Tragons across
  the park (its station and heads, the lift hill, the loops, the helix, a corkscrew, the fake mountain with no crater,
  the lagoon's spray); the park near the ride (shops, turrets, queue canopies of guests, a carousel, topiary, lamps,
  banners, crowds on the paths). Round the ride (tragons/scenery.ts): the ground going back from 0.5 to 1.7 (banded
  lawns, mowed stripes running to the eye, the promenade and a near path with snow banked, flower beds), the lagoon
  (banded water going back, its kerb, ripples, lily pads, a rowboat), and props at 0.6 / 0.73 / 0.87 slid along under
  the ride and sorted in among the tracks by depth (gift shops, a carousel, the teacups, a gatehouse, pines; queue mazes,
  dragon topiary, bare trees with fairy lights, the ON-RIDE PHOTO kiosk; crowds looking up (two frames), carts, benches,
  urns, a balloon seller, lamp posts with banners), none in the lagoon, the mountain or the halls; the fake mountain in
  stepped plaster (snow cap, strata, seams, a painted waterfall, a staff door, pines). The steel (tragons/steel.ts): two
  rails a gauge apart in depth (open from above and below the eye, twisting round the spine through a roll), ties, the
  lane's box spine in steps with its stripe lit, running lights after dark, lattice supports from a strip cached per
  hour and haze band (one drawImage each) on concrete footings, torn broken ends, rockwork tunnel portals. The dragons
  (tragons/dragon.ts): scaled hulls, gilt trim, belly plates, folded veined wings, gem lamps, the chassis and wheels, the
  lit back, the handlebar on brass posts with leather grips; the tail and its tip and the head (jaws open, teeth, a slit
  eye, frills) per dragon (FIRE ivory horns and a flame tip, ICE crystal horns, an icicle beard and a spade, LIGHTNING
  zigzag antlers and a bolt); painted once per lane, car and hour into a sprite (one drawImage a car), the lamps, eye,
  breath and a spare's wings live. The halls (tragons/station.ts): back walls at 0.84 (stained glass in the dragons'
  colors, banners, lanterns, a snowy roof, turrets), flagstones going back, the canopy's underside and its carved
  fascia with lanterns; the load station's three heads breathing and the gilt name, the guests waiting behind ropes,
  the dispatch booth, the iron gate (a rope across it on the revisit); the unload's decks in oak on stone piers, lit
  along their tops, the yard, the gate arch out to the castle. The obstacles redrawn (the hoop's far half behind him, its
  near half over; the icicle gantry snowed on and dripping; tesla coils; the burner; the ice bar; the stone dragon tower;
  the snow cannon; the stepped storm cloud), the throws (a fireball's trail, the strike's tell and bolt), the breath; the
  warnings as enamel plaques with gilt rims (a broken-track shield, a loop medallion), labels on little banners, gilt
  countdowns; the loop and controls cards as storybook shingles. Kill cams: the ash heap and embers under his fists, the
  pond's banded ice and snowbanks and pines, chunks in ice shells skating, the lightning's soft flash, the splat's dent and
  clods. His ride poses: wind streaming off him braced and in the loops. Performance: the sorted list worked out once a
  frame (it was twice), each track point worked out once. Drawing only: no layout, timing or hitbox changes.
- (SNES pass, the castle's base and the runway) He's AT the castle, so the monument hands over to keep/far.ts: THE INNER
  WARD painted close at the screen's own pixels (no more drawCastleAt blown up 2.8x), cached per hour, on the horizon
  over every wall he climbs: its curtain wall and round towers, the chapel (rose window, star spire), the great hall
  (slates, dormers, chimneys, bell turret), a clock tower, THE KEEP (buttresses, three tiers of lancets, a big rose
  window, long banners, a machicolated crown, corner turrets under blue cones) and THE HIGHEST SPIRE with PIPER'S WINDOW
  (pink stained glass, a gilt heart, a balcony) glowing, sparkles round it; out on the runway the same ward off to his
  left. Under it the sky, cirrus and cumulus (the high ones from up the tower), birds or fireworks, the Alps, the glen's
  park, and the castle's own grounds (only from up on the walls: the frozen outer moat and its skaters, the hedge maze,
  paths of guests, queue canopies, the broom port's stands far off). keep/paint.ts: the castle's ramps and parts
  (ashlar, merlons, slits, lancets, banners, cone roofs, drums, sconces and live flames, stand slabs, hoardings, lamp
  posts, topiary, seeded guests); keep/view.ts: the run-of-stamps helper. One eye (art.ts): the barbican's yard wall and
  its flagstones, its gateway (portcullis up, the ride's glow), a knight in a niche, the Great Pixie's statue fountain,
  topiary, lamp posts, the barbican tower (its ledge corbelled out, lit); the moat going down out of the picture (faces
  going back, the old water line, a drain dribbling, a bucket on a rope, a WET FLOOR cone) with the castle's front wall
  along its far rim; the gatehouse (bartizans, portcullis, gilt crest, machicolations, its roof lit) and, veiled till
  he's in it, the passage (red runner, beams) and YE OLDE GIFT SHOPPE (shelves of merch, a rack of gowns and a mirror,
  a barrel of wands, plush Pipers, snow globes, the till and its bored cashier); the veil a shopfront (leaded bays
  glowing, window boxes, striped awnings). The courtyard's far wall (an arcade with lanterns, lancets, banners, towers
  under cones), a well, the rose garden (lawn, a sundial, a rose trellis, urns). The curtain wall's face (buttresses,
  niches with a fairy and a unicorn, sconces, banners), the walk's top and the parapet (not over the breach); the
  breach (broken ends going back, rubble, scaffold poles and a PARDON OUR PIXIE DUST banner (no planks: nothing to read
  as a platform), and through it the outside: the frozen moat, pines, guests at a rope staring in); the hoardings in
  timber and pink shingle. The tower's inside up out of the picture at every height (lancets, tapestries, portraits,
  banners, crests and sconces, shields and swords, beams), iron chandeliers on chains, its shell either side, the
  landings and gallery on corbels (a balustrade behind, dimmed); its outside behind the steps (lancets, banners, a
  gargoyle, ivy); the postern yard backstage (CAST MEMBERS ONLY, kegs, a costume rack of spare tiaras, bins, a hay cart,
  a knight on his break, helmet off) and the postern gate's wall seen end on. The boutique with its sides going back,
  pilasters, a gilt crown, a scalloped awning (dimmed), the salon inside (heart wallpaper, bulb-ringed mirrors, a
  chandelier, chrome dryer hoods, pink chairs). The broom port (keep/port.ts): stands of seeded guests waving pennants
  and foam fingers, house-colored hoardings, a striped canopy, stand towers in house drapes with boxes of guests up
  top, bunting, the scoreboard (FINAL TRIAL / LAST MAN FLYING GETS THE HIGHEST WINDOW; NO FLIGHTS TODAY on the revisit,
  the stands empty), two sets of gold hoops, the deck going back (planks, a dashed center line, chevrons, landing
  lights), wind socks with lanterns, broom racks (bare after). The drawbridge (planks, straps, linked chains, the winch
  turning on the tell), the murder holes in stone surrounds (the pour in steps, a crown of splash, steam), the rose beds
  in bloom, the cauldrons in iron steps; brooms and the cradle. The cast: the guard (mail, quartered tabard, kettle
  helmet, beveled halberd), the jester (parti hose, bell shoes, dagged collar, some in greasepaint), the lady (brocade
  bell gown, hanging sleeves, girdle, banded hennin and veil, painted fan); the same poses and deaths. Drawing only:
  no layout, timing or hitbox changes.
- (SNES pass, the broomstick deathmatch) Inside the magic wall the Great Pixie keeps her grounds in summer (as the glen
  is): green lawns mown in rings, flowers; outside it's the land's winter. The mode 7 floor's texture (broom/ground.ts)
  is now 2048 px at 6 units a texel (was 1024 at 12) with four averaged copies (was two) picked per row, and past its
  edge the park beyond's own repeating tile (and its copies) instead of a flat color; the same scanline sampler at
  400x300. Painted once for the hour, the A Link to the Past way (lit from the north-west, shadows down and right): the
  base a texel at a time (hard-edged rings: the lawn's mown rings with tufts and clover, gravel paths and avenues with
  kerbs, the moat's mud in bands between its revetments, the park railway's ballast, sleepers and rails, the wall's
  walk and merlons, the glen's moss); then the castle from above on its crag (the curtain wall's walk and merlons, the
  courtyard's flags, the hall's and chapel's slates, the keep and its turrets' cones, the spire's cone, the drawbridge,
  its long shadow), the moat's puddles, cart, footprints, rowboat, ladders and WET FLOOR cones, the flower border and
  benches round it; lamp posts and strolling guests along every path, tree rows down the avenues; eight gardens (THE
  HEDGE MAZE (a real maze, a fountain in its heart), a mirrored parterre, the rose garden and its gilt arbors, two
  spectator lawns (blankets, umbrellas, a queue maze, a bandstand, food carts), the topiary garden and its swan pond,
  THE FLOWER CLOCK, Piper's heart garden), lawns between with trees and beds; the broom port (stands packed in the
  houses' colors, the deck's planks, the red runway, chevrons, landing lights, the scoreboard, hoops, wind socks, broom
  racks, crowds); the watchtowers' plazas and long shadows; five rings of plots out to the wall (gift shops with
  awnings, teacups, carousels, food courts, queue mazes, storybook cottages, ponds, the Flying Unicorns, show buildings
  with their backstage roofs) with trees, beds, umbrellas and crowds between; the glen's forest (3400 trees: oaks,
  blossom, lilac, frosted firs; the brook and its footbridge, the meadow and its plywood rainbow, the gingerbread
  cottage, the mine's hill, the dragon lair's skull, a toadstool ring); the railway's train and station; the wall's pink
  shimmer; beyond it Hogsmeat's snowy roofs, streets, church and clock tower, the frozen lake and its skaters, Truelling
  Tragons' three tracks, loops, fake mountain and lagoon, the fairy wheel and its plaza, Rapunzel's tower, the
  beanstalk, a windmill, all over the tile's snowy pine woods, paths, cottages and frozen pond. After dark the lamps,
  the landing lights, fairy lights and windows are painted on after the hour's light. The splatters still bake in on
  top (setSplats / paintSplat; only their patch of every copy remade), a wet glint and more gore added. The sky
  (broom/sky.ts): banded by the hour, rings round the horizon that wrap with his heading (stars, the moon, cirrus,
  stepped cumulus, the beanstalk's cloud castle; THE ALPS; the far park on the horizon with its landmarks at their real
  bearings), the sun, birds by day, fireworks after dark. The billboards (broom/sprites.ts) at twice the resolution with
  chains of averaged copies (no shimmer far off): THE CASTLE painted for the arena (monument.ts's proportions, Piper's
  window exactly at PIPER_WINDOW: the crag in strata with moss, ivy, the switchback road and its lamps, a cascade; the
  curtain wall, its lancets, banners, guards and gate; corner, mid and far towers; the hall and chapel; THE KEEP with
  buttresses, lancets, rose window, banners, machicolations, pinnacles, flying buttresses; the side spires; the highest
  spire, her balcony and window, the gilt star), the watchtowers (plinth, door, lancets, a lookout gallery with a
  guard and lantern), four trees, banner poles in four frames, the balloons (gores, crest, basket and riders, a live
  burner flame); the suitors through copies too. Meathead's behind view stepped (same pose: 7b18744a's), the fall, the
  throws and bolts (the homing shot a heart), the corpses; the laser beam stepped; her window's close-up for the zoom
  (a moulded arch, leaded diamonds, the gilt heart); the HUD bits in the storybook's gilt (the radar a magic mirror with
  a turning N, the altimeter a gilt slot with the sky banded in it and her window a heart, the suitors' cards, the
  plate, gilt-rimmed edge arrows and markers, a sparkle aim, sweeping sparkles for the lock-on, a turning red frame
  with hearts when locked). The revisit's side view (broom/side.ts): a wall walk high on the castle's crown, the
  grounds far below through the same mode 7 floor (watchtowers and balloons on it), the parapet with banners and
  sconces, the walk's lit front edge over corbels, the stair turret, her chambers' tower and its glowing door, a snapped
  broom, a tiara, petals and glass. Drawing only: no layout, timing or hitbox changes.
- (bedroom, ours) SNES'd (room.ts; still art in stamps: the walls in 256-wide stretches, the wreck a stamp a stage, each
  piece of furniture its own; live only what moves). THE HALL: a tall lancet in pink and lilac leaded glass, its rose
  smashed through (shards in the cames, the sky, the Alps and two spires out the hole by the hour, a drape torn),
  glass on the runner (glints live); striped satin paper, a cream wainscot, pink marble pilasters with gilt sconces,
  painted lunettes under a coffered vault (the hall's ceiling was 280 up with 260 of nothing over it), portraits of her,
  her tapestry over a console of roses, the plaque, her door (carved pink leaves, heart knockers, a crowned P on a broken
  pediment). HER ROOM (1500 wide, the furniture where it was): rose damask in gilt-framed panels between fluted marble
  pilasters, a rose-garland frieze, a deep crown molding, a raised-panel wainscot, the carpet in bands with gilt borders
  and petals; the trophy wall's heads mounted (CHAD, SIR DEREK with an apple, WAYNE, HANK with his lance and a tiara,
  BLAKE choking on his shaker, THADDEUS and his broom: X-eyed, tongues out) under the chalked scoreboard; the vanity
  (tulle skirt, perfumes, a candelabra) under the huge crowned mirror ringed with bulbs (its glass live: the room soft in
  it, her reflection, cracked from stage 2, a piece out from 5); the rococo wardrobes (one ajar on her gowns and a boa);
  the chaise; the canopy bed (twisted gilt posts, a fringed valance, sheers, a plush of her) under a gilt crown corona
  with drapes; the viewing balcony on balusters and corbels before arched doors open on the grounds by the hour; crystal
  chandeliers (flames, glints, glow live). The wreck reads by stage: stepped cracks; holes through the cornice into the
  crawlspace's mains with dust streaks and rubble; the damask torn in strips off bare plaster; wall holes (studs, pink
  insulation, risers); gashes; cables with bare ends. Over the ceiling, seen when the camera pulls out: the dollhouse
  cut (joists, the park's crawlspace with its duct, water main and valves, the lagged HEAT main, the frosted LN2 pair
  (LN2 DO NOT LICK), the FX POWER tray, work lights; the spire's cone inside: rafters, purlins, a king post, stored merch,
  an oculus) and the sky by the hour round it (drawBackdrop). The fight's bits: the heat pipe (bands, a nozzle glowing
  red to white in the tell, steam roaring, the fire banded with a white core, a scorch), the nitrogen (frost crystals
  creeping in the tell, vapor dribbling, the jet banded with fog), the live water (ripples, the burst main dribbling in,
  the cable's frayed copper, sparks crackling at it in the tell, arcs and a glow when live); debris as cornice chunks
  (gilt, damask, lath) with dust trickling; the chandelier's chain spitting sparks; her throws stepped (a licking fire
  ball, a faceted ice ball); the ice block bevelled; stars; splats in drips; her holes scorched. The cork: splintered
  boards, the closet under hers cut away (joists, a rail of her gowns) with her hem and kicking legs in glass heels, the
  geyser banded with spray and steam, the turd a coil; the roof hole up through the cut to the sky. The balloon's heap:
  the gown pooled, bones, her skull, the tiara, the wand. The fallen chandelier drawn by the room (a revisit had none).
  The walk-away: the walk-in's lane and cottages, the Alps, Hogsmeat's roofs, the castle whole over them (her window
  smashed; the cork's hole through the cone with a rafter up, or her streak), petals, a dropped tiara. Drawing only:
  no layout, timing or hitbox changes.
- (the user's: "snowy and green. combination of both") THE CASTLE GROUNDS are both, the same from the broom (broom/
  ground.ts, so the revisit's side.ts too) and from the castle's walls (keep/far.ts): green lawns, mowing stripes and
  beds in bloom (the Great Pixie's magic) with the land's winter on them: patchy snow (thawed green between, dithered
  edges, the stripes reading in it), drifts along the wall, the moat's rim, hedges and the deck, snow caps on the maze,
  topiary, trees, roofs and cones, paths frosted with banked kerbs, the drained moat's mud partly frozen (skaters on
  its ice from the walls). The glen stays the summer gag. The broom's texture now paints in steps: the runway primes it
  a few ms a frame (arena.ts primeGround) so taking off doesn't hitch; the splatters still bake on top. Drawing only.
- (the user's: QTE close-ups; "slightly reduce the number of suitors"; slumped dead; Piper lines once a life) THE
  FAIRY WHEEL UP CLOSE (wheel/closeup.ts): the whole QTE shows a painted close-up box under the panel (the gondola
  rocking, the grapple following who's winning: his palm in Meathead's face, forehead to forehead, a headlock; sweat,
  gritted teeth, Meathead's pants as they are); a win is a ~2 s close-up kill cutscene (no HUD, SKIP >>) per kind (the
  face into the post x3, hoisted and heaved, piledriven, swung by the ankles, the bouquet down his throat; each one
  shits himself), then the side view takes the kill on (kills.ts RESUME); a loss is a close-up of the suitor heaving
  Meathead over the side (his sneer, Meathead's face), then the fall. Six suitors now (DUANE and LORENZO off: every kit
  once), every fourth gondola; the QTE level stretched over the old 0..7 so the last three still get three beats. The
  dead in the carts slump (suitors.ts Slump: sat, tipped, head lolled, arms hanging to the world's down, swaying with
  the cart); thrown ones lie on the plaza on their backs, legs in the air, their hat knocked off by them, kept for good
  (stageMemo 'fantasy-wheel-corpses'). Meathead's kill and wheel-clear lines are picked once a life (piperLine).
- (the user's playtest of TRUELLING TRAGONS) Blank and slow on the ride: the ride's zoom eases all the time and the
  engine's stamps are keyed by exact scale, so the far park, the halls and every prop were repainted a stamp a step
  (big canvases piling up to the budget); now cached once per whole device scale and put down scaled (tragons/
  cache.ts), the castle in 2% steps. His depth is the car he's really on; his own dragon and the track under it never
  go over him; the track's cut short (64) round the trains and through anything spun, so a corkscrew's or the helix's
  far side no longer draws over his head. Hops WRAP (up off the top lands on the bottom, down off the bottom on the top:
  a longer arc over the middle one; spun or gone trains skipped); over each dragon he's not on, the button that takes
  him there (TragonMarks.tsx, live pad / keys, hidden while he can't hop). The live rail reads from far off: hazard
  bollards with bolt plaques, the rail glowing and arcing more as it comes, a building crackle, a countdown and LIVE
  ROOF: JUMP! over the dragon, its roof crackling blue-white along its length with arcs, sparks and strobing lamps while
  it's live (timing and hitbox unchanged). The mountain's mouths: a bore cut into rock at the track's depth, going dark
  in steps (dithered) from each mouth, black inside, the rock face round the opening with an overhang, snow and ferns
  (no ring stuck on). The entrance: the glen's marquee re-centered so the full name is in the picture at the glen's end
  (crest, gilt frame, tag line, bulbs), the heads big under it, a WARNING board, YOU MUST BE THIS TALL, queue rails; the
  station gets its own marquee hung low over the platform and a height board. The halls' play-plane things (and the
  castle's sign at the exit) are sorted in after the supports behind them. Drawing only, but for the hop's wrap.
- (the user's: "entering the door to truelling tragons still has nothing render") The cause: the load station's
  dispatch booth did a save and a translate with no restore, so any frame the station was on screen everything after it
  (the tracks, the dragons, the ground, him) drew a world away: a blank void till the station slid off (a checkpoint
  start on the ride never saw it). Restored. The ride's announcer no longer calls out the holes, loops or the near miss
  (the user's: the telegraphs are obvious); the welcome, the rules, the drops, the tunnel, the splash and Piper stay.
  Its still-art cache paints in bands of 1, 1.5, 2 and 3 (never brought down more than a third), the park's props in
  six looks a kind so they all stay cached; the castle's left to the engine's stamps (no repaint mid-zoom).
- (the user's: "make piper's model more detailed. when it does a closeup of her face, do a gross ren and stimpy style
  closeup"; "make the lightning and ice traps in her lair look more detailed too") PIPER, more detailed in every pose
  (piper.ts; sizes, poses and anchors unchanged): veined, glittered, straining wings (a tear, an oil-slick sheen), the
  beehive's roots, strands, bobby pins and frizz, a stone gone from the tiara; two-tone eyeshadow, liner, clumped lashes,
  bloodshot eyes, foundation caked to a line at the jaw, glitter in the sweat, smeared lipstick (on her teeth too), lip
  hairs, stubble on the chins, a haired beauty mark; sequins all over the gown, both seams laddered, a split under the
  arm, the thigh split dimpled, a sweat stain, the straps biting; cellulite and stubble (patterns, painted once) on her
  arms and legs, a varicose vein, chipped polish, rings sunk in her fingers, a ribbon off the wand. The CLOSE-UP is now a
  John K GROSS-UP (piperGross.ts): her face filling the screen, painted per pixel in long stepped ramps with ordered
  dither (pores, blackheads, a cold sore, nose hairs, a haired wart, cracking foundation, mascara clumped and running,
  gaps, gold teeth, lipstick on them, bloodshot eyes, three chins), cached per face, mouth shape and eyelid twitch; live
  over it: glitter twinkling, sweat running, drool (sultry) or spittle and throbbing veins (rage), the tic, a lurch and
  jitter; same timing. The traps (bedroom/mains.ts, same places, sizes and timings): real plumbing stamped once per
  look (lagging, silver bands, bolted flanges, valves; scorched and glowing for the heat main; frost-rimed with icicles,
  torn foam and a hazard band for the nitrogen; a burst copper water main and a frayed three-core cable for the wires),
  stepped fire with smoke and embers, frost ferns over wall and floor, the nitrogen plume with fog rolling along the
  carpet, arcs crawling over the flood with steam; her fire ball, ice crystal, forked bolt and the ice block redone.
- (the user's: "slightly widen piper's fight plane. make it so you get slightly more leeway when hazards are
  everywhere") Her room 1500 to 1700 wide (layout.ts ARENA_W). Re-spaced: the left side about a tenth out (wardrobe
  R(580), chandeliers R(400)/R(1220), chaise R(800), vanity R(450), trophies R(165), portraits 650/850), the bed R(1000)
  and the far wardrobe R(1320) +140, the ottoman R(1470), balcony R(1570) and its window +200 (to the far wall as
  before); pilasters 36/400/750/1316/1508; the wreck's scatter spans the wider room. The throw's pull-out to 0.48 (was
  0.52) so a far hop still frames the room. The mains: the tell longer (heat/nitro 55 to 70, wires 45 to 60, still
  safe); placed 480 apart (was 420); the nitrogen's jet 260 (was 280), the flood 140 half-wide (was 150); and never all
  three at once: a main due to start its tell holds, quiet, while the other two are both telling or on, so a whole
  main's stretch of floor (well over a body or two wide) is always clear. Damage, her moves and everything else as was.
- **Encounter pass (2026-10-21; the user: "some areas seem like they can be mindlessly cleared by walking forward and
  pressing fire. don't come up with new enemies but find more creative uses for their placements and the obstacles").**
  Existing kinds and terrain only, the same counts, HP and damage; the fairy wheel, the Tragons, the broom deathmatch,
  the scenes and Piper untouched. Nobody newly placed inside a checkpoint's safe start (spawnSafe.ts SAFE_X 360:
  placements there are silently left out on a respawn).
  - **The town square (square/layout.ts CAST):** the carousel's bro and princess walked at him on the cobbles one after
    the other (the princess inside THE GORGE's reach): the bro's up on the carousel's deck under the canopy's clerk (the
    staircase's way: one throwing down, one in the way), the princess out of the checkpoint's reach. The gorge's knight
    out of GINGERBREAD LANE's reach. Gingerbread lane was four on the ground in a row (troll, knight, bro, dragon): the
    bro's up on the porch over the troll (balls bouncing down while the shockwaves run along the ground: the spiked
    helmet's no dive kick either), and the knight's past the second roof's snow (draw his charge under it: the slab
    hits him too) in front of the dragon. The bandstand's crowd was four on the ground with the dragon inside THE
    BANDSTAND's reach: the dragon's out of it, the princess up on the balcony with the clerk (two throwing down) over
    the dragon, the bro and the knight.
  - **The enchanted glen (glen/layout.ts CAST):** the briars' clerk stood inside THE STORYBOOK BRIDGE's reach: now at
    the briars' near edge with the ginger (casting while it runs at him; up on the first toadstool, the ginger comes on
    into the thorns). The cottage garden was gingers on the ground one after another (the last inside THE DWARF MINE's
    reach): one's up on the woodpile, leaping on him as he comes down off the roof, the last at the edge of the gallows
    cauldron's swing (a leap at him there goes up into its path). The dwarfs' team (a row: the candles say no dive
    kicks, a charge into the first takes the line) out of the mine's checkpoint's reach. The meadow's second unicorn
    stood inside THE DRAGON'S LAIR's reach: it's down at the foot of the lair's far side now, charging along under the
    steps as he comes down them (no shouldering the horn: a dive kick from the steps). Left: the far shaft's dwarf and
    the queue's crowd sit inside checkpoints' reach on stretches no wider than it.
  - **The castle's base (keep/layout.ts CAST):** the gate's lone guard and the courtyard's princess stood inside their
    checkpoints' reach: moved just out. The ramparts' first clerk stood on THE RAMPARTS' spot: now between the
    machicolations' second and third holes (casting through the rolling wave; knock him into a pour). Past the breach the
    courtier and the guard stood inside THE TOWER STAIRS' reach: the courtier's right where the far staircase lands him,
    the clerk behind her (two throwing across the swinging flight). The postern yard was a ground line (guard, jester,
    unicorn, courtier) inside THE POSTERN's reach: the wall's last guard and the yard's jester are up on the steps down
    the tower's far side (below him coming down: the halberd chops up at a jump over, a dive kick's fine; the pins come
    up from the step under), the yard keeps its guard, unicorn and courtier. Left: the clerk past the breach, the
    yard's three sit inside checkpoints' reach on stretches no wider than it.
