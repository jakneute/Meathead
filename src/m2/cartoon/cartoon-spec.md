# Cartoon Land (land id `cartoon`): the spec

Given to every agent working on the land. The user's brief first, verbatim; then the fill-ins (decided by us, the
user's to overrule), the section plan, the standing rules, and the decisions log (newest last).

## The user's brief (verbatim)

```
we enter into a seuss landing esque place. a section of the park built for kiddie rides with a whimsical theme. introduce a new platforming mechanic here. go through the square, avoid the rides. have meathead lament why he went here because "there's no good rides here". as you progress through, you enter an indoor ride that promises you to 'learn the magic of how cartoons are made' (established 1994).

you walk through this building, fighting off enemies inside as lights come on as you progress showing animators working and glossing over the process as you advance. make it seem like the americans are the real visionaries and the Koreans who do the hard tedious work animating it are the 'suckers'. the voice then goes 'this process was used to make this season's hot new tv show: Chelsea Clinton and socks the cat's wacky white house adventures.'

here's where it gets wacky. you enter behind a screen and meathead is in a cartoonish version of the white house. suddenly a third hand eraser comes in and erases meathead's sprite, then a pen comes in and draws a socks the cat/meathead hybrid of meathead. he has the same moves, the special guns are the same, but the ray gun is replaced by spitting out a hairball. meathead can also use his claws to climb walls up vertically. Chelsea Clinton tells you that her mom and dad are out of town for a UN summit and 'mean men' have invaded the white house, like a home alone thing. she just runs around and nags you like navi, telling you what to do while meathead tells her to 'shut up'.  she can't be harmed.

you progress through a large cartoonish white house facing various obstacles, as a cat. there are 5 minibosses you fight along the way. they are more tanky enemies but they otherwise don't have special attacks. they should take about 30 seconds to a minute to beat with concentrated fire. they are in this order: ross perot, jerry Falwell, rush Limbaugh, bob dole and finally, in the oval office at the end: newt Gingrich. they are cartoonish impersonators of you. they will taunt you like Saturday morning cartoon characters but about their policies, like jerry falwells anti lgbt rhetoric, etc. meathead is baffled by this. everything about it. he has no idea what the fuck these guys are referencing and he wonders what kind of psychotic kid would want to watch this show. nevertheless, the show died after a few episodes. the creators really banked on this being a big hit and spent a whole lot of money with theme park rides associated with this hair brained show for kids. the minibosses are simple "mario bosses" who just jump around and throw shit. charge moves involve having your claws out. you can still grab and throw regular enemies, despite being a cat and beatdown involves rapidly scratching them to death as you pin them down. the sub bosses here cannot be grabbed "too greasy".

at the end of the socks segment a tv screen with bill and Hillary thank you for your service by stopping those 'bad men'. the projector screen showing the cartoon chaos collapses showing meathead wasn't actually a cat but it was a clever tv projector making it look like he was. like an early snapchat filter or something. you see tons of dead bodies in the aftermath. meathead then leaves the cartoon studio.

the next section is more platforming but involving bigger, more intense rides based on 'big kid' y7 like shows and early adult animated shows, like the simpsons. meathead still refuses to ride them because he is prejudiced against rides that don't have a track. he thinks those rides are for 'pussies'. they will try to run into you though. you will see posters for another failed mid 90s tv show producers put way too much stock in: a show called "stupid dad". the only surviving member of the show is the guy who voiced the titular 'stupid dad'. every other principal cast member died from alcoholism or alcohol related deaths, like DUIs. the lone surviving cast member - now in his 70s - is also incidentally an alcoholic too. the show is a sad pathetic playback of him interacting with his tv family - who are cheap animatronics - as he sits on the couch and asks his kid to get him another beer so he can watch the football game. this is clearly a low effort simpsons knock off. meanwhile, he drinks actual beer during performances, but we haven't gotten there yet. i'm explaining the setup for the time we get to the boss fight.

we then enter an area that is a tie in to the show: a clear itchy and scratchy knock off where a legally distinct cat and a legally distinct mouse try to smash each other to death with hammers. this is a part of the "stupid dad" extended universe portion of the park. you will eventually reach an amphitheater of the stage show where 'stupid dad' recreates scenes from the show. you approach the stage from the left. there's a security guard who won't let you on. since most boss doors involve kicking down a door, this 'boss door' is the security guards nuts. you kick him there, he keels over, and you have free access to the stage and the boss fight against "stupid dad". mechanics come later.

do this after your snesification is done with fairy land.
```

The user's notes since (relayed):

- **The satire: less jokes at the real figures' expense, more "who the hell are these people".** The comedy is the
  absurdity of a kids' show built on 90s political figures and Meathead's total bafflement, not dunking on the people.
  The pundits' taunts are Saturday-morning-cartoon versions of their 90s talking points, played straight by the show;
  the punchline is Meathead not getting any of it. They're cartoon-show impersonators (parody). Meathead never gets the
  references, and his age stays ambiguous. The studio narration's smugness is the satire's target (the Americans as
  self-styled visionaries, the Korean animators called "suckers" by the park).
- (Later, from the user, on quality:) "do not skimp on quality work though": full game feel, well-tuned layouts,
  genuinely funny specific lines, readable characterful art (crude-first-pass, no SNES pass yet, but clean, specific and
  appealing), thorough edge cases (checkpoints, revisits, deaths).

## Fill-ins (ours; the user's to overrule)

- **The land's weapon:** the MALLET (store.ts LAND_WEAPON: cartoon -> MALLET). The walk-away's placeholder hands it
  over (walkAway/stupidDad.ts, its act: walkAway/acts.ts's MALLET).
- **The new mechanic: THE SWAYING STACK-TOWERS** (sway.ts). A storybook stack of lumpy candy-striped tiers with a flat
  lid on top, rooted at its foot. It leans under his weight toward the side he stands on (the lid's left half tips it
  left, the further out the further it goes; dead center it holds with a nervous wobble); off it, it springs back
  upright, wobbling. The lid's a moving platform: it carries him out over a gap, across to the next tower, over a
  ride's path. The lid stays level enough to stand on (it tilts a little with the lean in the drawing only). The tell:
  the tiers creak and the stack bends like a noodle (the lean mostly up top), wobble lines off it; a thud when it hits
  its limit (it bounces off). Its lid's lit along the top (standable reads standable); the tiers under it are scenery.
  The cast don't use them. Every tower chain is built to work both ways (lean toward where you're going: the gaps are
  too far upright, close enough leaned). Later sections place their own (makeTowers / updateTowers / drawTowers).
- **The monument: THE CARTOON LAND WATER TOWER** (monument.ts): a fat pink tank on bandy legs with a goofy painted face
  (googly eyes, a buck-toothed grin), CARTOON LAND round its belly, a propeller beanie roof (the propeller turns). On
  the far hill behind every outdoor section, bigger each time (MONUMENT_AT: the kiddie square 0.42, the big-kid rides
  0.7, the knockoff area 0.95, the amphitheater 1.3; the studio and the White House are indoors: none). One painter,
  drawn in the walk-in and the walk-away too (drawTowerAt).
- **The parody's names (legally distinct):** SILLYVILLE SQUARE (the Seuss Landing parody: "RIDES FOR THE LITTLE ONES"),
  the WUMPLE-GO-ROUND (the kiddie carousel of made-up beasts: zizzle-horns, floofalumps, snergs...), the WISH-FISH
  SPINNER (the fish-bowl spinner), the SNOOZLE CHOO (the kiddie train), the SKY-HIGH TROLLEY (the elevated trolley), the
  SWEET-TOOTH SHOPPE, the HAT-HAT HATTERY, the ONE-SCOOP SHOPPE, the BOTTOMLESS BALL PIT ("LAST KID FOUND: 1997"), the
  YOU MUST BE THIS SHORT TO RIDE stick, LEARN THE MAGIC OF HOW CARTOONS ARE MADE (EST. 1994) (the studio's front; a
  cardboard animator stand-in labeled VISIONARY by the door).
- **Sillyville's cast (all new kinds, `m2:ct_*`, kiddie/kinds.ts):** the park's costumed performers, men and women of
  every skin, build and hair, seeded; each its own attack with a tell; each new hurt voiced, with death screens:
  - STRIPEYHAT CAT (`ct_hatcat`): a plum cat suit, painted whiskers, cat ears on a band, a tall teal-and-white striped
    stovepipe hat, an orange bow tie, a furled umbrella held out like a foil (POINTY). Lifts the hat off (the tell) and
    flings it: it boomerangs out and back (hurts both ways; he's bareheaded meanwhile); up close, an umbrella jab. He
    speaks in rhyme (it's in his contract).
  - WHATSIT ONE and WHATSIT TWO (`ct_whatsit`, always a pair, the number on the chest): red jumpsuits, blue fright wigs,
    each flying a kite: the kite shakes (the tell) and dives at him, then climbs back (the land's airborne threat); on
    the ground, a crouch and a wiggle (the tell), a mad dash, then dizzy (birdies).
  - BALLOON VENDOR (`ct_vendor`): a striped vest, a boater, the balloon bunch. Twists a balloon dog (squeaks: the tell)
    and lets it go: the BALLOON DOG (`ct_balloondog`, a 1-hp flyer) bobs after him and pops on him (shoot it first); it
    floats off into the sky when its time's up (gone, not killed). Two out at most each. Up close, a shin kick. Balloon
    dogs bleed (the drones do too: the joke's kept).
  - FACE PAINTER (`ct_painter`): a spattered smock, a beret, a palette, a brush. Dips the brush (the tell) and flicks
    three blobs in a fan; they splat on the ground (harmless after). Up close, a brush across the face.
  - CAPTAIN SPRINKLES (`ct_mascot`): the sugar-crazed cupcake mascot (a pleated paper-cup body, a frosting-swirl head
    with googly eyes and a lit birthday candle on top: SPIKY; the performer's wide eyes in the mouth hole). Vibrates
    with sugar (the tell), three bounding leaps at him (never into a ball pit), then the sugar crash: slumped, candle
    out, Zs (his window). Too big to grab.
  Dead, the costumes give (the hat rolled off, the wig off, the beret, the balloons gone, the cupcake head off).
- **Sillyville's hazards (hazards.ts):** the rides, each hurting him and the cast alike (none of the cast idles in
  one: hazard zones), each with a readable rhythm: the carousel's beasts (the front half of the turn, coming at him;
  the canopy is a way over), the spinner's fish (the front half, each fish rising and falling), the train (out from
  behind the end hedge at him along the ground after a whistle; jump it; round behind the hedges back), the trolley
  (out of the hattery's wall along its track after a bell and a flashing lamp; up onto a tower's lid over it, and
  leaning a lid too far puts him back in its way). THE BALL PITS: bottomless; in, and he's spat back out where he last
  stood safe, hurt (the cast are spat out dead). Its own hurt lines and death screens.
- **Meathead's lines:** he hates it ("there's no good rides here": the user's line, verbatim, in the carousel's pool;
  every ride gets its own lament); arrival, revisit, the tower's first lean, the pit, the mascot, the studio door.
  Never anything about his age.
- **Stupid Dad's fight:** NOT designed (the user: "mechanics come later"): the amphitheater is a placeholder end (the
  boss-door refill, the guard by the stage, VICTORY, the walk-away, the hub). Don't invent the fight. Sin: probably
  sloth (proposal).
- **Music:** none yet. Cartoon Land's in music/cues.ts's LAND_OF_STAGE, and with no `land:cartoon` song it's quiet.

## The section plan (world x; checkpoints numbered across the land)

CTX = 900000. Gaps of 3000 between sections (room to grow).

| # | Section | id | World x | Checkpoints | What |
|---|---|---|---|---|---|
| 1 | Sillyville Square | `kiddie` | CTX+0 .. CTX+14000 | 0-9 | The kiddie rides, the towers, the ball pits; the studio's door |
| 2 | How cartoons are made | `studio` | CTX+17000 .. CTX+27000 | 10-19 | The 1994 walk-through; lights come up; the narration |
| 3 | The wacky White House, part one | `whitehouse1` | CTX+30000 .. CTX+42000 | 20-29 | Redrawn as Socks; Chelsea; Perot, Falwell |
| 4 | The wacky White House, part two | `whitehouse2` | CTX+45000 .. CTX+57000 | 30-39 | Limbaugh, Dole, Gingrich; the Clintons; the projector |
| 5 | The big-kid rides | `bigkid` | CTX+60000 .. CTX+72000 | 40-49 | Trackless rides that ram; Stupid Dad posters |
| 6 | The cat-and-mouse knockoff | `itchy` | CTX+75000 .. CTX+85000 | 50-59 | Stupid Dad's extended universe; hammers |
| 7 | The amphitheater | `amphi` | CTX+88000 .. CTX+92000 | 60-69 | The guard's nuts; STUPID DAD (placeholder) |

### Section 1 in detail (Sillyville Square, built: kiddie/)

x from the section's start; heights up from the ground line. See kiddie/layout.ts's header.

- 0 THE GATE (cp 0): the land's sign; the YOU MUST BE THIS SHORT TO RIDE stick; a lone hat cat.
- 1300 THE FIRST TOWER, alone and safe: off a toadstool onto its lid, lean right over to the SWEET-TOOTH SHOPPE's roof
  (too tall to jump; a pickup); a step down its far side (and back up, going the other way).
- 2400 THE FIRST BALL PIT: a painter; a tower on each bank leaning out over it (the near one forward, the far one back).
- 3100 THE WUMPLE-GO-ROUND (cp 1): the Whatsits; the carousel's beasts (or up a tower to its canopy: a pickup); a painter
  and a cat past it.
- 4800 THE WISH-FISH SPINNER: a balloon vendor; the fish; a tower past it that leans back into the fish's way or on to
  the ONE-SCOOP SHOPPE's balcony (a pickup); the mascot.
- 6400 THE BOTTOMLESS BALL PIT (cp 2): three towers across it, a gumdrop ledge to the far bank; the Whatsits' kites from
  the far bank; a vendor.
- 8250 THE SNOOZLE CHOO (cp 3): the train at him along the ground; a cat; a painter on a toadstool over the track's end;
  a tower up to the HAT-HAT HATTERY's roof.
- 10000 THE SKY-HIGH TROLLEY (cp 4): along its track over a ball pit, the trolley coming up behind; three towers whose
  lids stand over the track; a vendor on the hattery's roof; down off the far end.
- 12400 THE STUDIO DOOR (cp 5): the mascot and a mixed crowd; the studio's front; its door is the way on.

### Section 2 in detail (LEARN THE MAGIC OF HOW CARTOONS ARE MADE, built: studio/)

A walk-through dark ride on foot: one long building cut away along its back, the path in front behind a velvet rope,
the rooms as dioramas drawn to one eye. Each room dim till he walks in, then its lights come up (a clunk, two flickers,
soft fills: never a spotlight) and the NARRATOR (`m2.cartoon.narrator`, a cheesy 1994 corporate announcer on the PA,
voiced; studio/pa.ts: one line at a time, never over anybody, each room's story once a visit) tells him about it; the
words on screen only while said. x from the section's start (see studio/layout.ts's header):

- 0 THE LOBBY (cp 10, lit from the start): the queue, the marquee (hung on chains), the front doors back out to the
  square (its left end); a tour guide. "WELCOME, BOYS AND GIRLS..."
- 800 1 THE VISION: Dave's office as a shrine: his portrait in oils (ponytail, round glasses, goatee, smug), the GOLDEN
  DOODLE AWARDS, "I SEE THINGS. - DAVE", THE NAPKIN (a stick cat, a coffee ring) under glass on a marble plinth; Dave
  himself an animatronic, feet up, jerking his mug up to his mouth. "THAT NAPKIN IS NOW INSURED FOR TWO MILLION DOLLARS."
  An intern alone (the coffee), then a guide.
- 1800 2 THE WRITERS' ROOM (cp 11): the whiteboard of bits (WACKY??, MEOW-VAL OFFICE), the joke jar with a dollar in
  it, writers in backward caps (one asleep, one on a brick phone, one tossing a nerf ball). The pitch exec alone (the
  laser), an intern.
- 2800 3 STORYBOARDS: a wall of pinned panels; across the path THE ROLLING STORYBOARD WALL (too tall to jump): up the
  flat file and the drafting table, over it (a pickup), down the box of pencils (and back up). Pencil Pete past it.
- 3800 4 THE VOICE BOOTH (cp 12): egg-crate foam, gold records; in the booth the star in sunglasses at take forty of
  "MEOW." (RECORDING lit over it); the engineer's desk, VU meters bouncing; the TALENT chair. Security, an intern, an exec.
- 4800 5 MODEL SHEETS: Socks' turnaround (DO NOT DEVIATE), Chelsea's, the wacky faces, APPROVED stamped on everything;
  the art director (a sweater over his shoulders) stamping. THE DRYING RACK: a cel shuttling on its overhead trolley
  over safe floor (the moving platform taught) up to the maquette shelf (a pickup). Pencil Pete, a guide, an intern.
- 5600 6 OVERSEAS (cp 13): the long room: three rows of light tables going back, the night shift (Korean men and women,
  tired, drawing; one asleep on the desk with the pencil in his hand, one yawning, one on a cot under a desk; noodle
  cups, thermoses), the clock at quarter to three, the calendar crossed off to DEADLINE, the fax from Dave (NEED 9000
  MORE BY FRIDAY!! THX), the city at night through the windows; the park's banner over it all (OUR OVERSEAS PARTNERS!, a
  grinning globe). Before the lights come up, only their light tables glow in the dark. THE REJECT PILE across the path
  (crumpled drawings, deep: in, and he's coughed back up where he last stood, hurt; the staff go under for good), three
  STACKS OF DRAWINGS in it that lean under him (the land's towers, sway.ts, drawn as bundled reams with scene labels),
  light tables at either end as steps. An intern and a guide before it, an exec lasering from the far side, security.
  "WHAT SUCKERS!" Meathead's say back calls it.
- 7600 7 INK AND PAINT (cp 14): drying racks of cels, shelves of paint jars, painters at long tables; THE PAINT VAT
  across the path (three runs of color, stirring; same rules as the pile), two cels on the overhead track shuttling
  over it (meeting in the middle: off the low one up onto the high one). Pencil Pete, an exec, an intern.
- 8600 8 THE CAMERA: the rostrum camera on its column, soft boxes, film cans, exposure sheets; across the path a WALL
  OF FILM CANS (too tall): THE CAMERA CRANE's seat goes up and down to its top (a pickup), a crate down the far side
  (and back up). Security, Pencil Pete.
- 9200 9 PREMIERE NIGHT (cp 15): the red carpet, a step-and-repeat, cardboard press with flashbulbs, the show's big
  promo board on its truss with chasing bulbs (CHELSEA CLINTON AND SOCKS THE CAT'S WACKY WHITE HOUSE ADVENTURES! SATURDAY
  MORNINGS!); the narrator's line, the user's, verbatim; the mixed crowd; then THE SCREEN (the title card projected on
  it): walk in behind it (his shadow on it) and on to whitehouse1. "THE MAGIC CONTINUES BEHIND THE SCREEN."

The staff (`m2:ct_*`, studio/kinds.ts, seeded people, men and women): the TOUR GUIDE (`ct_guide`: souvenir plates
flung flat; the flag pole jab; POINTY), the INTERN (`ct_intern`: four coffees lobbed, then a shove), the PITCH EXEC
(`ct_exec`: the laser dot crawls up him to his eyes, stops, blinks, gets him if he's still there; the binder), PENCIL
PETE (`ct_pencil`: the mascot, a giant number two: a corkscrew spin across the floor, dizzy after; the hip check; the
point on top is SPIKY), STUDIO SECURITY (`ct_guard`: the whistle and a bull rush, winded after; the flashlight).
Dead, they drop what they carried.

### Section 3 in detail (THE WACKY WHITE HOUSE, part one, built: whitehouse1/)

The show's White House as a Saturday morning cartoon draws it (flat bright colors, fat black outlines, wobbly
columns and frames; rooms cut away along their backs to the one eye). x from the section's start (whitehouse1/layout.ts):

- 0 THE ENTRANCE HALL (cp 20): THE TRANSFORMATION the first time in (transform.ts: a cutscene, no input, no HUD, SKIP >>
  for the lot): the animator's giant hand rubs him out with a pink eraser, stroke by stroke from the flat-top down
  ("HEY. HEY! WHAT THE FUCK?"); a beat of nothing; the hand draws him back in with a pen, an ink line along the edge, as
  SOCKS THE CAT / MEATHEAD; his line; CHELSEA runs in with the briefing (UN summit, mean men) and he tells her to shut
  up. Memo `ct-wh-cat`; a later way in from the studio is a quick scribble back into the cat and his line. The title
  banner hung off the ceiling; a lone goon past it (the hairball taught on him).
- 1100 THE CROSS HALL: THE RUNAWAY VACUUM (a 1990s upright, nobody pushing it) up and down the carpet, alone: in front of
  it, it drags him toward it; run into, it sucks him in and spits him out (hurt). A goon at the far end.
- 2200 THE EAST ROOM (cp 21): JUST WAXED (the engine's slick, state.groundOil: he slides, so do they; the yellow A-frame
  sign); a lobbyist, a goon on the wax, the spy blimp; the STEINWAY (a step), THE SWINGING CHANDELIER (a one-way ledge on
  its top ring) up over THE CHAIR STACK (too tall), down the risers (and back up them).
- 3700 THE PRESS ROOM (cp 22): pickups, then ROSS PEROT (arena 3900..4700).
- 5000 THE STATE DINING ROOM (cp 23): the mean men eating the state dinner, up and down the banquet table; mixed.
- 6400 THE GRAND STAIRCASE (cp 24): BOWLING BALLS out of the presidential bowling lane's ball return on the landing (its
  light and the pins rattling first), bouncing down the stairs step by step, into the return grate at the bottom.
- 7600 THE CENTER HALL (second floor): mixed.
- 8450 THE LINCOLN BEDROOM (cp 25): JERRY FALWELL (arena 8500..9300: the Lincoln bed, two ledges).
- 9350 THE WEST SITTING HALL (the fan window), 9950 THE TRUMAN BALCONY: drop off into
- 10300 THE ROSE GARDEN (cp 26): THE SPRINKLERS (pop up, sputter, a column of water: cats hate water), THE ROSE BUSHES
  (thorns), the mean men, a topiary STACK-TOWER (sway.ts) up off the arbor back onto the balcony (the way back); the
  West Colonnade and TO THE WEST WING at the far end: on to part two (the right end; stub).

**Socks-Meathead** (Player.catForm, set every frame by the section; the shared cartoon index clears it each frame before
the section's update): the engine's render/player/catBody.ts: the same brute (barrel chest, slab shoulders, square jaw,
the flat-top as a flat-topped head of black fur, the crushed brows and scowl, stubble on a white muzzle, his jeans and
belt), black fur, the white bib, white socks fore and hind (barefoot cat feet), cat ears, whiskers, a pink nose,
yellow-green slit eyes, a long tail out of his jeans, a spiked collar. His own frames for everything drawPlayer draws:
idle (tail swish, ear flick), walk, jump/fall, duck (crouched to pounce), the charge (claws out, raking, hissing), the
slide (feet first, hind claws out), the uppercut (a claw swipe straight up), the dive kick (a pounce, hind claws
leading), hurt (fur puffed, tail bottle-brushed), his weapon in his paw. body.ts's primitives hand over to the cat's
while it's on, so the grabs' poses (the beatdown: claws raked down him, a scratch sound, white streaks) and the weapons'
own poses are the cat too. The GUN is a HAIRBALL (combat/weapons.ts: hacked up out of his mouth, muzzle.ts's CAT_MOUTH;
the gun's damage, slower, drooping; a wet fur splat; its own sounds `hairball` / `hairsplat`; its own kill pool
`hairball_kill`; the HUD says HAIRBALL). NO wall climbing (the user's). His death in cat form is the cat's own
(catDeath.ts, `own:cat`): rigid, up in the air yowling, flat on his back legs up X'd out, his ghost floats off.

**Cartoon kills** (state.cartoonKills, set by the section while the projection's up: core/cartoonKills.ts): no blood
particles, no gore, no bodies; whatever dies goes up in a cartoon puff (poof.ts: the cloud, stars, a twinkle; sound
`poof`); bodies he flings still fly and bowl people over, and puff where they land. The M2 weapons that leave their own
bodies (the gore slide, the spawner, the crossbow, the soul sucker's grinder, the stunt car) puff instead.

**Chelsea** (chelsea.ts, voice `m2.cartoon.chelsea`): the show's cartoon Chelsea (curls, headband, braces, purple
sweater, plaid skirt), really the adult actress doing a kid's voice: runs after him, darts ahead to point the way,
nags every 15-22 s (clean/shitty/naked), a hint the first time he reaches each thing, "SOCKS! ARE YOU OKAY?" now and
then when he's hurt; he tells her to shut up about every other nag. Not an enemy: nothing touches her. In a fight she
cowers by the wall; after each pundit's puff she's green, a hand over her mouth, about to be sick, then excitedly hurries
him on (queasy()).

**The mean men** (`m2:ct_goon` the henchman: knuckle-crack swing, crouch-and-tackle; `m2:ct_lobbyist`: the briefcase
pops open, a money bag lobbed; `m2:ct_pollster`: licks the pencil, a clipboard flung flat; `m2:ct_blimp`: the spy blimp,
the hatch beeps, a stink bomb and its green cloud). Seeded people (men and women, every look).

**The pundits** (pundits.ts, punditArt.ts; voices `m2.cartoon.perot`, `m2.cartoon.falwell`): Mario bosses, midBoss,
`grab: 'none'` with "TOO GREASY" (they squirt out of his paws); own health (Perot 3900, Falwell 5400: ~30 s / ~45 s of
hairballs) on a big engine pool; both sides lock till dead; markBossFight every frame ('perot' / 'falwell': no songs yet,
quiet); memos `ct-wh-perot` / `ct-wh-falwell` (never back once beaten). PEROT hops, leaps onto the ledges and the
podium gliding down on his flapping ears, lobs pie charts (split in three below half). FALWELL: heavier leaps (a thud),
puts his little pulpit down and thumps the Bible on it (the tell), lobs a Bible or flings a collection plate (two in a
row below half). Each fight opens with a short scene (Chelsea names him, his entrance and piece, Meathead's "WHO THE
HELL..."; SKIP >>; the scene's once a visit, straight to the fight after). Death: he reels saying his last, then a puff
with his costume flung off out of it (his head mask, his ears / glasses, charts, Bible, pulpit); Chelsea queasy;
Meathead's say. Their real deaths are job 4's backtrack.

### Section 4 in detail (THE WACKY WHITE HOUSE, part two, built: whitehouse2/)

The West Wing, one floor, the same cartoon look and eye as part one (whitehouse2/layout.ts, art.ts). x from the
section's start:

- 0 THE WEST COLONNADE (cp 30, outdoors: the Rose Garden behind): a goon, then a SPIN DOCTOR alone (taught).
- 1100 THE WEST WING OFFICES: THE FILING CABINETS (too tall to jump; impassable): their drawers burst out of both
  faces top first, stay out, and slam shut bottom first (each a ledge while it's out: a staircase, a race up it before
  the bottom ones shut; whichever drawer he's on, the one above is already out); one bursting out into him shoves him
  off, hurt. A short one alone (one drawer), then a tall one (four), the spy blimp over the gap; a pollster and a
  DITTOHEAD (taught) past it.
- 2300 THE ROOSEVELT ROOM (cp 31), done up as the EIB studio (ON AIR lit): a lobbyist, pickups, then RUSH LIMBAUGH
  (arena 2650..3450: his broadcast desk, two shelves).
- 3600 THE KITCHENS (cp 32): THE RANGE across the way (a step up; four burners on top: the ring glows and ticks, then
  a column of fire, in turn); THE JELLY MOLD (land on it: it throws him up) to THE POT RACK over the range (a pickup, a
  way over the fire); a goon, the blimp over the range, a dittohead, a spin doctor.
- 5000 THE CABINET ROOM (cp 33): pickups, a goon, then BOB DOLE (arena 5450..6250: the cabinet table, two shelves).
- 6400 THE MAP ROOM (cp 34): THE GLOBE on its stand; past it, it wobbles, drops off and rolls after him (faster and
  faster, never quite as fast as him), flattening the pollster in the way; up the step onto the map cabinet; it smashes
  on the step and splits in two (GLOBE_MEMO: stays split). A dittohead past it.
- 7800 THE SITUATION ROOM (cp 35): SECURITY LASERS: two blinking beams alone (they flicker first), a goon, then THE
  SWEEPING BEAM (across the room, up and down: over it low, under it high) between two more blinkers; a spin doctor.
- 9300 THE OUTER OVAL (cp 36): breathing room, three pickups, the Oval Office's door.
- 9950 THE OVAL OFFICE: NEWT GINGRICH (arena 10000..10800: the Resolute desk, two shelves). Its far wall is the end of
  the show's White House till the screen's down; then the wings past it (backstage) and the STAGE DOOR (lit EXIT sign)
  at the far right: on to the big-kid rides (his line as he goes).

**The new mean men** (whitehouse2/kinds.ts, kindArt.ts; seeded people, men and women): the SPIN DOCTOR (`m2:ct_spindoc`:
a lab coat over a pinstripe suit; turns on the spot faster and faster (the tell), then a whirlwind across the floor that
bounces off a wall once and spins the other mean men in its way too; dizzy after (his window); a slap up close), the
DITTOHEAD (`m2:ct_ditto`: a red EIB cap, a DITTOS T-shirt, a transistor radio; antenna up and the dial cranked (the
tell), then a sound wave rolling along the floor at him (over it); another dittohead near enough does the same a moment
later; a shove up close). Part one's goons, lobbyists, pollsters and the spy blimp are about too.

**The pundits, part two** (pundits.ts, punditArt.ts; voices `m2.cartoon.limbaugh`, `.dole`, `.newt`): part one's rules
(Mario bosses, midBoss, TOO GREASY, own health: Limbaugh 5000, Dole 5800, Newt 7400 (about 40, 45 and 60 s of
hairballs); both sides lock; markBossFight; memos `ct-wh-limbaugh` / `-dole` / `-newt`; the scene once a visit; the reel,
the last words, the puff with the costume flung off; Chelsea queasy). Each has a window (no special attacks: a beat
where he's down): LIMBAUGH (big, heavy leaps) puffs his cigar (a smoke ring: the tell) and lobs it lit (three below
half), or holds the golden EIB mic up (ON AIR: the tell) and flings it out on its cord and reels it back (it hurts both
ways); winded on the floor after some heavy landings ("COMMERCIAL BREAK!"). DOLE (lean, springy; his right hand always
holds his pen) holds a pineapple up in his left (the tell) and lobs it (it bursts in chunks below half) or flings a BOB
DOLE campaign button flat; the pratfall off a leap now and then, flat on his face ("BOB DOLE IS OKAY!"). NEWT holds the
Contract with America up (the tell) and lobs it (two in a row below half) or bangs his gavel on his palm and flings it;
below half, now and then, a tantrum on his back about the back of the plane. Their talking points played straight as
Saturday morning taunts (the radio show, dittos, talent on loan from God; third person, where's the outrage, the 15% tax
cut; the Contract, the shutdown, Air Force One); Meathead baffled.

**The finale** (finale.ts; one cutscene from Newt's puff, no input, no HUD, SKIP >> for the lot): Chelsea green but in
character ("LOOK, SOCKS! IT'S MOM AND DAD! ON TV!"), him; a cartoon TV swings down out of the ceiling: BILL and HILLARY
(`m2.cartoon.bill`, `.hillary`) at the UN thank Socks for his service stopping those bad men (by the state of him);
"WHO THE FUCK ARE YOU TWO?"; snow, off. The picture judders (Chelsea: the walls are wobbly); the actress's own voice
breaks through; THE SCREEN COMES DOWN (the cartoon falls away from the top, squashing down as the cloth heaps over the
stage's lip); the real stage behind. The projector (a 1994 three-lens video projector up on a truss tower at the stage's
corner) still paints the cat on him a moment, flickering, then it slides off him like a decal: he's himself ("I WASN'T A
CAT. IT WAS A FUCKING PROJECTOR."); the projector sparks and dies; the work lights clank on. The NEWT ACTOR in front of
the desk, FLAYED (every player sees him); "OH. SO THAT'S WHAT A POOF LOOKS LIKE."; THE ACTRESS who played Chelsea
(`m2.cartoon.actress`: a grown woman in the costume, the wig half off) on her knees being sick, nonstop: "GET OUT. JUST
GET OUT OF HERE."; his answer. Sets `ct-wh-collapsed` and checkpoint 37 (the real stage). After it, while he's about,
she's still at it (and at him to go, now and then); once he's left the White House, she's gone for good
(`ct-wh-actress-gone`: her wig and her mess where she knelt).

**The real stage** (realStage.ts, bodies.ts; both halves once `ct-wh-collapsed`): no cat, no cartoon, no Chelsea, no
puffs, no hazards (blood's back); a black-box soundstage: black drapes, the pipe grid and its lights, scenery flats'
backs stenciled with the rooms, floor tape, the show's TV cameras in the wings; everything he stands on plywood (black
boxes stenciled PIANO, PODIUM, DESK, STOVE..., planks on stands, scaffold stairs and a scaffold deck for part one's
second floor; the drawers plywood steps out for good, the jelly mold a stunt trampoline, the globe a split fiberglass
ball); the fallen screen heaped along the lip; the empty front row below it (popcorn, a foam finger). Part one's chair
stack and topiary tower were the show's: scaffold steps down off the deck's end instead (the way back up). The dead,
static, brutal, specific to how a cartoon kill really ends a person: NEWT flayed (the Oval Office); PEROT face down over
the podium, the rubber ears torn off with his own, the pointer snapped off in his back (part one's press room); FALWELL
on the Lincoln bed, choked on hairballs, blue, his mouth crammed with black fur (part one); LIMBAUGH hanged by his own
mic cord off the studio's boom over his desk, the ON AIR light lit, his cigar still smoking (the Roosevelt Room);
DOLE on his back across the cabinet table, a pineapple split into his skull, campaign buttons pinned into his chest,
the pen still in his hand (the Cabinet Room); and every mean man's actor he killed, where he killed them (each half
keeps its list: `ct-wh1-dead`, `ct-wh2-dead`), in his costume in his blood, claw marks; crashed blimps (they bleed).
Meathead's lines at each, once a visit. The HUD wears the studio's skin there.

### Section 5 in detail (THE BIG-KID ZONE, built: bigkid/)

The park's 90s "extreme" zone for the older kids (zigzags, confetti, neon, chain-link, skate-park concrete; its signs
jagged lightning-cut boards on hazard-striped poles, the letters slanted and dripping glop: art.ts zoneSign). Its rides
are bigger and TRACKLESS, every one a legally distinct knockoff: they roam loose about their own patch, line up on him,
give their tell, and go for him; each hurts him and the cast alike (hazard zones keep the cast out of their way); he
never rides one (nothing on a ride is lit to stand on). x from the section's start (bigkid/layout.ts):

- 0 THE ZONE GATE (cp 40): out of the White House's stage door; the neon arch (THE BIG-KID ZONE / NO TRACKS. NO
  LIMITS.); a poster column; a ride op alone.
- 820 THE POSTER WALL: a plywood fence pasted with STUPID DAD: faded, graffitied (a mustache, horns, SUCKS), CANCELED,
  peeling.
- 1250 COUCH DUDES' CRUISIN' COUCH: a plaid couch on a go-kart chassis (two animatronic slacker teens on it) out of its
  garage, wandering the street; it turns to face him, headlights flash, the horn twice (the tell), then it floors it and
  skids to a stop. Jump it, or get up on the newsstand's awning or the bus shelter's roof (the PARK SHUTTLE).
- 2750 THE STUPID DAD STORE (cp 41): EVERYTHING 90% OFF (a NOW 95% sticker); beer-can hats, mugs, foam couches in the
  window; the CLEARANCE! PULL MY STRING! bin of talking dolls (walk up and one goes off: `m2.cartoon.daddoll`, a
  pull-string recording of the show's star: "BOY! GET ME A BEER!"; his say back, the first time); the awning (a pickup).
- 3700 THE GLOP PIT (green slime, bottomless; the kiddie ball pits' rule: spat back out where he last stood safe,
  hurt; the cast die in it): three towers, too far apart upright (lean into each gap), stacked GLOP drums on each bank
  (solid: the way back up); Gloppy on the far bank hocking loogies at him on the lids.
- 4900 SPAZ & STINKY'S BUMPER BASH (cp 42): a fenced rink (hazard-striped rails, a chain-link back, the electric
  ceiling grid out of reach), three riderless bumper cars, one to each bay between the rink's two towers: they wander,
  spin, line up (the pole's light flashes, the buzzer: the tell) and ram; they bounce off the rails and each other, and
  ramming a tower's foot sets it swinging (with him on it: on a lid, the cars go for that tower's foot). The scorer's
  stands up to the lids.
- 6450 IN LOVING MEMORY (cp 43): breathing room. The faded family mural (AMERICA'S NEW FAVORITE FAMILY!); the bronze
  plaque, THE VOICES OF STUPID DAD (MOM, THE BOY, SIS, GRAMPS, with their years, all dead 1996-1999; THEY'LL ALWAYS BE
  FAMILY.); dead flowers; a crushed beer can somebody left on it; a bench. No causes stated (the boss tells it).
- 7250 GIGGLES THE CLOWN'S HURL-A-WHIRL: four barf-bucket cars on arms round a clown-head hub (purple tufts, a
  cigarette, bags under his eyes) that rolls loose about its plaza; the cars at two heights (jump the low, walk under
  the high); every few seconds the eyes spin, the calliope honks, it shudders (the tell) and lurches over to him. A ride
  op who sets it on him; THE FLEA past it, leaping over.
- 8500 DETECTIVE DRAKE'S MOTION MADNESS (cp 44): the simulator pod on four hydraulic legs, kept to its plaza: crouches,
  hisses, beacon flashing (the tell), hops at him and lands like a dropped fridge. Then THE GLOP PIT, PART 2: a harder
  chain (taller lids, the middle tower leans further), Gloppy, a churro vendor and the Flea on the far drums.
- 10560 RAD RAT'S TUBULAR HALFPIPE (cp 45): a giant riderless skateboard rocking in a concrete halfpipe (sloped ground
  runs); drop in, cross, jump it at the bottom (it's always at least once).
- 11400 THE WAY ON (cp 46): the STUPID DAD LIVE billboard (THE AMPHITHEATER, SHOWS DAILY. BEER GARDEN OPEN., THIS WAY
  >: the boss set up); a mixed crowd; the arch to STUPID DAD: THE EXTENDED UNIVERSE (the right end: on to `itchy`).

**The zone's cast** (bigkid/kinds.ts, kindArt.ts; seeded people, men and women, every look): the RIDE OP (`m2:ct_rideop`:
a bored teen, headset, traffic wand; hand to the headset (the tell) and the ride he's in or by comes straight for him;
no ride: a traffic cone lobbed; the wand up close), RAD RAT (`m2:ct_skatepunk`: the skate punk mascot, a rat costume
head with a mohawk of real spikes: SPIKY; close, a crouch on the board then a rush and a bail; far, the board stomped up
and flung skidding along the ground, then he goes and gets it), GLOPPY (`m2:ct_gloppy`: the gross-out show's slime
monster; cheeks puffed and a gurgle, then a loogie lobbed that leaves a sticky puddle (half speed through it); a belly
bump; too big to grab), THE FLEA (`m2:ct_flea`: the big blue superhero; fists on hips ("SPATULA!"), a leap, hangs fist
down (the tell), dives at where he was, sticks head first in the street, legs kicking), the CHURRO VENDOR
(`m2:ct_churro`: the sugar bag shaken (the tell), churros thrown flat; close, the cart rammed at him; winded after).
Dead, the costumes give (headset, rat head, cowl, paper hat, Gloppy's top; the cart tipped over).

**His lines** (bigkid/lines.ts): every ride its own trackless lament; TRACKLESS (the running sneer: "NO TRACK? THAT'S
FOR PUSSIES." and the like, by pants), said now and then as a ride lines up on him (only fresh lines); he's never heard
of STUPID DAD (the posters, the graffiti, the store, the doll, the memorial, the billboard).

## Standing rules (all apply; check every one against new work)

American spelling; signs readable, held up, themed lettering (toonSign: a lumpy cloud board on a curly candy-striped
pole, the park's fat bouncing letters; never the stock font); dialogue blunt, short, vulgar, specific (talk less);
clean / shitty / naked pools for Meathead and everybody reacting to him; pickLine; no line twice within 45 s; speech
text only while spoken; no talk-over; cutscenes hide the HUD, skip all-or-nothing, no player input; subtitles whole on
screen; death-screen text 28 characters at most; every new hurt source gets voiced hurt and death lines; never spell
out that Meathead arrives anywhere by accident; Meathead's age stays ambiguous. Standable reads standable (lit top
lips); impassable reads impassable; NO DUCK / JUMP text on obstacles; hazards hurt enemies too (none idle in one);
despawned enemies never count as kills; kill callouts per kind; checkpoints restore world state; revisits work (every
tower chain goes both ways) and should differ; fake-3D rules (one shared eye, no depth layer over nearer things, cull
by the real view, interiors hidden until entered, signs attached); lights soft; NO VOLCANOES; no walk-right-and-hold-
fire stretches (mix airborne and grounded threats); M2 lean drops and softer hits; move-counter enemies (pointy /
spiky) where fitting; six-button budget; breathing room after drops; a boss-door refill before the boss; main bosses
666 HP, the 60-frame breather, non-weakness damage 35%; sub-bosses lock both sides till dead, never respawn once past;
markBossFight every frame of a boss or sub-boss fight. Voice every new line (`npm run voices`, `npm run voices:m2`).

## Decisions log

- (job 1) Skeleton: seven sections at CTX = 900000 with 3000 gaps; the hub portal open; a crude-but-clean walk-in
  (walkAway/intoCartoon.ts: the candy path, wobbly houses, puff-ball trees, the water tower at the end); a placeholder
  end and walk-away with the MALLET (amphi/, walkAway/stupidDad.ts, 'stupid-dad' in walkAway.ts); a HUD skin per
  section (hudSkins/cartoon.tsx: cartoon, studio, whitehouse (both halves), bigkid, itchy, amphi); ?cartoon=<checkpoint>
  in dev; ?walkaway=dad (or =cartoon) previews the walk-away.
- (job 1) The mechanic is the swaying stack-towers (sway.ts); the user will judge it.
- (job 1) The water tower monument is one painter at a size per outdoor section, never a zoom.
- (job 1) The ball pits spit him back out where he last stood safe (hurt), rather than killing him outright: kiddie
  area, forgiving; the cast die in them.
- (job 1) The studio's door is the way on (walk into it), not the section's end wall; back from the studio, he's in
  front of it (DOORS.kiddie.end).
- (job 2) The studio is built (studio/). The room lighting is the engine's lighting (dark 0.64 in the building; each
  lit room a few big soft radial fills; blue aisle lights along the path; a soft glow round him so his words read),
  ramping up as he walks in; which rooms are lit is in state.stageMemo (`ct-studio-lit`): kept through deaths and
  after. Been behind the screen (`ct-studio-done`): a later visit's the revisit (house lights up, every room lit, the
  PA silent, the staff gone home but three night guards, the night shift still drawing: they never go home).
- (job 2) The narrator's a recording: no clean / shitty / naked pools for him (he doesn't react); Meathead's say backs
  after some rooms (talk less) and his gags wait for a gap in the tape (said when it's quiet, or not at all).
- (job 2) The land's mechanic comes back in the studio as STACKS OF DRAWINGS (the same sway.ts towers, drawn as paper)
  over the reject pile; the pile and the paint vat cough him back up where he last stood (the ball pits' rule).
- (job 2) The way on is behind THE SCREEN (walk past its middle, behind it: on to DOORS.whitehouse1.start); back from
  the White House he's put in front of it (DOORS.studio.end = studio x0 + 9560, set in geometry.ts). Job 3 does the
  erasing and redrawing on the other side.
- (job 2) The fake 3D: the eye is the middle of the screen; back walls at 0.78, the tableaux' props at 0.86, the rope at
  0.95 (studio/layout.ts D_BACK / D_PROPS / D_RAIL); partitions drawn in two halves round the props so nothing deeper
  ever covers anything nearer.
- (job 3) The White House, part one, is built (whitehouse1/; see Section 3 above). The cat form is an engine feature
  (Player.catForm; render/player/catBody.ts; the hairball in combat/weapons.ts + projectiles.ts; the cat's death via
  player/deathAnim.ts startCatDeath, drawn by whitehouse1/catDeath.ts), as are cartoon kills (state.cartoonKills;
  core/cartoonKills.ts: poofEnemy, purgeCartoonGore; hooked in effects.ts, enemies/deaths.ts, enemies/enemies.ts,
  render/world.ts, core/update.ts and the M2 weapons that keep their own bodies). The shared cartoon index clears both
  every frame before the section's update; a section that wants them sets them in its update.
- (job 3) FOR JOB 4 (whitehouse2): set `p.catForm = catActive(state)` and `state.cartoonKills = projectionUp(state)`
  every frame in your update (both exported from whitehouse1/index.ts), and put up Chelsea the same way (chelsea.ts:
  updateChelsea / drawChelsea / drawChelseaSaid / chelseaSays / queasy; the puffs: poof.ts updatePuffs / drawPuffs with
  punditArt's drawPuffBit). The projector's collapse sets `ct-wh-collapsed` (whitehouse1/state.ts COLLAPSED_MEMO): after
  that whitehouse1 stops the cat, the cartoon kills and Chelsea, but still draws the cartoon set and runs its hazards and
  mean men: the revealed plain stage and the four backtrack bodies (Perot in the press room arena, Falwell in the
  Lincoln Bedroom arena) are job 4's to put into whitehouse1 (its art.ts / index.ts, under that memo). Pundits' kinds:
  `m2:ct_perot`, `m2:ct_falwell`; their fight code in pundits.ts is reusable for Limbaugh, Dole and Gingrich (a Spec each).
- (job 3) The vacuum, the chandelier, the bowling balls, the sprinklers and the rose bushes all hurt the mean men too
  (hazardHit); none of the mean men idles in one (hazard zones). The bowling balls only roll while he's on the stairs.
- (job 4) The White House, part two, is built (whitehouse2/; see Section 4 above). Chelsea's world is pluggable now
  (chelsea.ts ChelseaWorld: her floor, her hints, where she cowers; part one's the default); part two hands her its own.
  The pundits' fight code is copied into whitehouse2/pundits.ts (its own state; each pundit a Spec, plus a window: the
  flop). Part one's mean men's throws and barks are drawn and run from part two too (whitehouse1 exports drawThrows).
- (job 4) The screen's collapse is one memo (`ct-wh-collapsed`); `presetMemos` (whitehouse2/state.ts, called first by
  both halves' builds) gives a fresh start along the way (the checkpoint cheat, a save) the world a run that got there
  left: redrawn as the cat past cp 21, each pundit dead past his room, the globe split past cp 35, the screen down from
  cp 37. Beaten Newt but the screen not down (left mid-scene): into the Oval Office and the finale runs again.
- (job 4) The bodies of the mean men's actors are only the ones he killed (by each half's CAST index, kept in a memo),
  not everybody: the dead are his. The ones still alive when the screen comes down were actors: they ran (gone).
- (job 4) Back from the big-kid rides he's put in front of the stage door (DOORS.whitehouse2.end, geometry.ts). The
  shared index switches the HUD to the studio's skin in either half once the screen's down.
- (job 5) The big-kid zone is built (bigkid/; see Section 5 above). The rides are one little state machine each
  (bigkid/rides.ts: roam / line up / tell / go / recover), worked out in the section's update, hurting him and the cast
  (hazardHit, hazard zones); a ride op's headset call (`sicRide`) sets the ride whose patch he's in on him at once.
- (job 5) The land's towers come back harder: gaps too far upright both ways (lean into every one), and in the bumper
  rink the cars ram the towers' feet (a kick to the tower's sway: `t.vel`), so standing on a lid isn't safe from them.
- (job 5) The glop pits use the ball pits' rule (spat back out where he last stood safe, hurt; the cast die). Pit banks
  are stacked drums, solid (impassable reads impassable); the couch's refuges are an awning and a shelter roof on poles.
- (job 5) STUPID DAD's setup, nothing more: the show (UBX, THIS FALL, AMERICA'S NEW FAVORITE FAMILY!, the dad's "BOY!
  BEER!"), the dead cast's plaque (the voice actors: MOM, THE BOY, SIS, GRAMPS; dates only, no causes), the LIVE show at
  the amphitheater on the billboard. The talking doll's voice (`m2.cartoon.daddoll`) is a pull-string recording, not
  the boss's own (his comes with the fight).
- (job 5) Revisit (`ct-bigkid-done`, set going out the far gate): the couch is parked dead outside its garage, OUT OF
  ORDER on a sawhorse, smoking; his arrival line is the revisit's. Back from the knockoff area he's at DOORS.bigkid.end
  (the default: by the far gate). The way on is still the crude right-end exit (job 6 swaps it).
- (job 5) Optional barks, his sneers and the doll only ever say a fresh line (pickFreshLine: nothing fresh, nothing
  said), so nothing repeats within 45 s however often they fire.
