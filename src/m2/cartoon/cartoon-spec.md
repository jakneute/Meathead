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
- **Stupid Dad's fight:** the user's design (2026-10-20, verbatim in Section 7 below), built (job 8: amphi/fight.ts):
  the couch, the mallet swat, the beer runs, the puke-rocket couch, the Donkey Kong rage, the clapperboard's cars for
  the family, the weakness death (flattened) and the standard death (the user's: the fridge tips over on him). Sin: probably
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
| 6 | PUNCHY & KICKY (the cat-and-mouse knockoff) | `itchy` | CTX+75000 .. CTX+85000 | 50-59 | Stupid Dad's extended universe; Looney Tunes violence |
| 7 | The amphitheater | `amphi` | CTX+88000 .. CTX+92000 | 60-69 | The guard's nuts; STUPID DAD |

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
- 11400 THE WAY ON (cp 46): the STUPID DAD LIVE billboard (THE ORIGINAL VOICE!, AS SEEN (AND HEARD) ON TV!, THE
  AMPHITHEATER. SHOWS DAILY., THIS WAY >: the boss set up); a mixed crowd; the arch to STUPID DAD: THE EXTENDED UNIVERSE (the right end: on to `itchy`).

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

### Section 6 in detail (PUNCHY & KICKY, built: itchy/)

The show inside STUPID DAD (the cartoon the Boy watches), a clear Itchy & Scratchy knockoff: PUNCHY the cat (ginger,
a torn ear with a sticking plaster, stitches, a mad grin, a mallet) and KICKY the mouse (grey-tan, huge pink ears, buck
teeth, red high-tops, a meat cleaver), smashing each other to death with hammers. The area's look is the show's: blood
red, mustard, black, bone; cartoon gore for decor (splats, drips off every parapet, chalk outlines of a cat and a mouse on
the path, skull lamps on bone posts); its signs a cream board with a dripping red rim on bandaged posts, a cleaver stuck
in the top, a mallet leaning on it (art.ts pkSign), the show's lettering blood red and dripping (pkLetters). The user's
Looney Tunes violence is the hazards (hazards.ts, drawn in hazardArt.ts), each taught alone on the flat, then in combos,
then with the land's towers; every one telegraphed, every one hurting the cast too, every one killing him for real (its
own hurt lines and death screen; the falling weights flatten him, the dynamite burns him black). x from the section's
start (itchy/layout.ts):

- 0 THE GATE (cp 50): in under the big-kid zone's arch; the bone arch (PUNCHY & KICKY, THE CAT. THE MOUSE. THE MALLETS.,
  the cat's and the mouse's heads at its ends); a Punchy alone. "FINALLY, A CARTOON THAT GETS IT."
- 650 ANVIL ALLEY: the GENERIC-CO drop gantry over the path. ANVILS on a cycle out of its trapdoors: the hatch rattles
  and a shadow grows on the path (the tell), the anvil drops with a falling whistle, sits on the path (a step, lit) and
  is winched back up. One alone, then three in a wave rolling left to right. A Kicky.
- 1700 THE LAWN (KEEP OFF THE GRASS, BY ORDER OF PUNCHY): RAKES lying tines up (the rake is the tell): tread on the tines
  and the handle comes up into the face. A Punchy who walks into one himself.
- 2300 THE MERCH STAND (cp 51): breathing room. PUNCHY & KICKY STUFF (plush heads, SAFETY CLEAVER AGES 3 AND UP,
  SPLATTER TEES, FOAM MALLETS); the JUMBOTRON playing the cartoon on a loop (the mouse flattens the cat's head with a
  mallet; the cat swings, the mouse ducks, the cat's foot; an anvil on the cat; the cat's dynamite, BOOM, a skeleton; the
  dripping title card). A stagehand laying PORTABLE HOLES (taught).
- 3050 PUNCHY & KICKY'S KILL-O-RAMA: the attraction's front (a red-and-black cartoon castle, the marquee: SHOWS EVERY
  30 SECONDS! NOW 40% MORE KILLING!; its doors dark and chained: nothing inside). GIANT HAMMERS: the giant animatronics on
  their plinths behind the path, the mallet hauled back over the shoulder with a ratchet's creak and the robot's eyes lit
  red (the tell), then down across the path; the head lies there a moment (a step), then goes back up. A Punchy alone,
  then the pair either side of the doors (Punchy and Kicky) in turn. The host past it.
- 4250 THE GENERIC-CO DOCK (cp 52; the warehouse: WE MAKE EVERYTHING. BADLY.): a CRATE THAT PUNCHES (it rattles, then a
  boxing glove on a spring at chest height: duck it or jump it); BEAR TRAPS open on the floor (snap, a hold, sprung for
  good: the run's); THE SAFE on the dock crane (the rope frays as he comes: strands snapping, its shadow; keep going
  and it misses, stop and it doesn't; down for good, the step up to the pallet rack's pickup); the dynamite mouse up on a
  crate stack; another punching crate.
- 5450 CANNON ROW (cp 53; PUNCHY'S BIG TOP behind, its HUMAN CANNONBALL poster): the CIRCUS CANNON at the far end,
  facing back along the row: the barrel dips (a low ball: jump it) or rises (a high one: duck it) and the touch hole
  fizzes (the tell), BOOM; its carriage is the step over it. THE PIANO on its hoist halfway (it drops once as he comes;
  its wreck stays: cover from the low balls). A Punchy, a dynamite mouse.
- 6500 THE FUSE (cp 54; KICKY'S BLAST RANGE, a scorched wall): a giant animatronic Kicky strikes a giant match and lights
  a long fuse along the path; the spark crawls to a TNT pile (the tell's the whole way); it goes up; a new pile rises out
  of the trapdoor. A stagehand past it.
- 7150 THE PAINTED CANYON (cp 55; AS SEEN IN 'MOUSE MESA': mesas painted on plywood flats, braces showing): three towers
  across a bottomless gorge (the big-kid zone's first glop pit's geometry: proven both ways); THE CANNON ON ITS LIFT behind
  the far rim rises to his height, fizzes and fires across (a low ball or a high one); the host on the far rim calling
  anvils. In, and he's dead (the user's: "falling down the mesa lands will kill you ... not teleport you"): the coyote's
  fall kill cam (itchy/deaths.ts: straight down the gorge, he hangs a beat, drops, tumbling smaller and smaller, the
  whistle, a tiny puff of dust far below); the cast go down for good.
- 8650 THE SET (cp 56; STAGE 9, PUNCHY & KICKY LIVE!, TAPING TODAY: drapes, the lighting grid, the APPLAUSE sign, the
  cat and mouse's house flat): a FLOOR OF PORTABLE HOLES (in, and he's dead: the user's "perpetually falling through
  black holes, forever" kill cam, itchy/deaths.ts: a painted black hole comes up under him and swallows him, out of
  another over a different painted backdrop, the next already coming; it goes on under the death screen); two towers across it (the big-kid zone's own spacing); a fuse along the fly rail and down a
  line to the far tower's foot (a GENERIC-CO igniter strikes its own match): it goes up and kicks the tower. A stagehand.
- 9650 THE WAY ON (cp 57): a mixed crowd; a rake; STUPID DAD's live-show posters; the STUPID DAD LIVE! gate (THE
  AMPHITHEATER >): the right end, on to `amphi`.

**The cast** (itchy/kinds.ts, kindArt.ts; seeded people, men and women, every look; dead, the costume heads come off:
the sweaty performer underneath): PUNCHY (`m2:ct_punchy`: the mallet hauled up overhead (the tell) and down in front;
off a way, a crouch with it cocked back, a leap and the mallet into the floor where he lands: stuck, tugging (his
window)), KICKY (`m2:ct_kicky`: the cleaver held out in front, POINTY; drawn back with a glint (the tell) and flung
spinning (it sticks in the floor), then another out of his pouch; close, up on one foot, knee up (the tell), the kick),
the DYNAMITE KICKY (`m2:ct_kickyboom`: a match struck on his teeth, a stick lit (the tell: the fuse fizzing in his
hand), lobbed; it lands still burning down and goes up, the cast too; fingers in his ears after; the kick), THE HOST
(`m2:ct_host`: the live show's ringmaster, tailcoat spattered with stage blood, top hat, bullhorn, cane; the bullhorn up,
"AND NOW... THE ANVIL!" (the tell), and an anvil's shadow follows him, stops and one comes out of the sky (it stays where
it lands: the run's, the last six); close, the cane), the STAGEHAND (`m2:ct_stagehand`: all black, a headset, gaffer tape;
a folded portable hole held up and wiggled (the tell), flung down short of him where it spreads out flat (a while, then
it peels back up); close, a sandbag swung). Voices `m2.cartoon.punchy(f)`, `.kicky(f)` (mask: costume heads; the
dynamite one too), `.host(f)`, `.stagehand(f)`.

**His lines** (itchy/lines.ts): he's never seen the show and he loves it ("FINALLY, A CARTOON THAT GETS IT." the user's,
first in the arrival pool); a gag at each set piece (once a visit); the safe and the piano when they come down; a hurt
pool and death screens for every hazard and every attack.

### Section 7 in detail (STUPID DAD LIVE!, built: amphi/)

THE UBX AMPHITHEATER: a concrete bowl dug into the hill, aluminum bleachers stepping down it, a band shell over the stage
at its foot, all of it to the one eye (studio/'s way: the play plane depth 1; every floor running back to the bowl's far
side, D_FAR 0.7; the shell 0.74; the set's wall 0.8; the furniture and the family each at their own depth). x from the
section's start (amphi/layout.ts):

- 0 THE GATE (cp 60): in from PUNCHY & KICKY's STUPID DAD LIVE! gate. THE MARQUEE on two striped steel posts (THE UBX
  AMPHITHEATER PRESENTS, STUPID DAD in the show's lettering, LIVE! in bulbs, THE ORIGINAL VOICE OF STUPID DAD, IN THE
  FLESH: HONK AZORIA!, SHOWS AT 11, 1, 3, 5 AND 7; a vinyl NO OUTSIDE BEER zip-tied under it), the dad off the poster on it.
- 560 THE BEER GARDEN: the stand (striped awning, COLD BEER 12 / LITE BEER 11 / NACHOS 9 / SODA ASK / NO REFUNDS, the
  taps, the neon BEER buzzing, a bored vendor, a tip jar); a high-top with two regulars swaying at it; a trash can of
  empties; the light poles.
- 1000 THE AISLE STEPS: down the bowl (two steps a bleacher row, twelve rows: the engine's stairs, terrain.ts steps);
  THE CROWD, what there is of it: eight people for hundreds of seats (one asleep, Zs; one passed out forward; a woman
  knitting; a drunk with a #1 foam finger; a guy in a STUPID DAD STORE beer-can hat; a beer; popcorn; one waving his cup
  at the stage), seeded people of every look.
- 1960 THE PIT: the empty front row of folding chairs (one RESERVED), litter (cans, cups, popcorn); THE BOSS-DOOR REFILL
  (a big health, a big ammo).
- 2580 THE GUARD at the foot of the stage steps, in front of the CAST ONLY rope (a wall till he's down: the boss door).
- 2620 THE STAGE STEPS up to the deck (cp 61 once the guard's down).
- 2780 THE STAGE (cp 62, the fight's, set as the intro starts): the band shell (a painted sunburst of cream and blue
  panels, chasing bulbs round its lip), the red STUPID DAD LIVE! banner hung off it on chains, the APPLAUSE sign (lit with
  the laugh track); THE SET, the sitcom living room (mustard diamond wallpaper, wood paneling, the window onto a painted
  street, the family portrait with a black ribbon across its corner, the clock stopped at five: IT'S FIVE O'CLOCK
  SOMEWHERE, the kitchen's swing door), the braided rug, the Boy's steel floor track; the TV on its cart (the game: the
  same tape every show; UBX in the corner), the couch (the poster's orange plaid, sagging, his dent in it, an afghan, the
  remote), his pyramid of empties.

**WHO HE IS** (the user's, 2026-10-21): HONK AZORIA is a voice actor. He voiced the dad on the animated STUPID DAD;
STUPID DAD LIVE! is a live-action stage recreation of the cartoon, Honk playing his old cartoon character in person
(the animatronic family on a sitcom living-room set). Made specific in a handful of places: the marquee (THE ORIGINAL
VOICE OF STUPID DAD, IN THE FLESH), the big-kid billboard (THE ORIGINAL VOICE! AS SEEN (AND HEARD) ON TV!), a TV
lower third on his intro close-up (HONK AZORIA / THE ORIGINAL VOICE OF STUPID DAD), his off-script mumbles (no
announcer, so he introduces himself; no fat suit, he grew into the part; he used to do it in a booth, in pants;
typecast: Shakespeare once, BOY! BEER! till he dies), his taunts and hurts (doing the voice; NOT THE THROAT), and
Meathead clocking him (THE CARTOON DAD'S VOICE GUY?) at the billboard and the show.

**STUPID DAD** (amphi/dad.ts, boss grade: color ramps, stepped bands, dithered seams): HONK AZORIA, the voice of the
dad (UBX, 1995), the only principal cast member still alive, in his seventies, a drunk. In the dad's look off the poster,
for real: the stained ribbed tank top (yellow under the arms, a mustard drip, a cigarette hole, a beer ring), the
blue-striped boxers, black socks pulled up (one slid down), brown terry slippers; the belly's real. Bald dome with liver
spots and a sweat sheen, the three-hair comb-over gone white, a white fringe, big hairy ears, heavy wild grey brows,
bloodshot half-shut eyes under heavy lids and purple bags, a drinker's nose (swollen, purple, veined), flushed cheeks,
white stubble, jowls; a faded Navy anchor on his forearm; a skin-colored headset mic taped along his cheek (a live
show). A can of SWILL LITE (a real beer) always in hand. Poses: sat, sipping (the can tipped back), calling for the Boy
(turned to the kitchen, a hand cupped), reaching for the new can, shaking a fist at the TV, squinting, getting up (two
rocks first, hands on his knees), stood (swaying), crushing the can on his forehead, shuffling. His close-up
(drawDadCloseup). Voice `m2.cartoon.dad`.

**The family** (amphi/family.ts): CHEAP ANIMATRONICS on the tapes of the dead actors' voices (`m2.cartoon.tvmom`,
`tvboy` (a woman voicing a boy), `tvsis`, `tvgramps`; fx radio): MOM behind the couch lifting a casserole in oven mitts,
THE BOY on his wheeled base on the floor track, SIS cross-legged on the rug facing the TV, GRAMPS nodding off in his
recliner and jerking awake. Waxy too-shiny skin, ventriloquist seams, the jaw dropping as a block, glass eyes that
don't track together, crooked wigs, a bolt in the neck, a cable to the floor; everything in eight-frame steps.
Glitching (the intro): heads ticking round, eyes spinning, sparks, jaws chattering. Off (over): slumped, jaws hanging.

**THE SHOW** (amphi/show.ts): on a loop (~25 s) till he walks on, its lines only once he's down in the bowl (the PA:
from the concourse, the swigs and no words): he watches the game, a swig now and then; "BOY! GET ME ANOTHER BEER!" (the
user's, first in the pool); THE LAUGH TRACK (a new sound, `laughtrack`; the APPLAUSE sign lit); the Boy rolls off
jerkily to the kitchen door (it swings), a clatter, back with a can, his arm out in steps, "SURE THING, POP!"; STUPID
DAD takes it, cracks it (`canopen`), drinks (a real swig; a belch now and then); then one more bit: a family tape and
the laugh track, him at the TV ("TOUCHDOWN! ...NO. IT'S THE SAME TAPE."), or him off script mumbling about the dead cast
to nobody (no laugh). The show's lines don't react to Meathead (he hasn't seen him): one pool each, the narrator's way.

**THE BOSS DOOR: THE GUARD'S NUTS** (amphi/scene.ts, guard.ts; voice `m2.cartoon.bouncer`): a big man, dark skin, the
head shaved and shining, a black goatee, an earpiece, a black SECURITY polo, the EVENT STAFF lanyard, cargo pants, a
radio on his belt, arms folded. Up to him and it's the cutscene: a palm up, "SHOW'S IN PROGRESS. NO GUESTS ON STAGE."
(the user's, first in every pool); a beat; the boot (the other lands' door kick: the kick pose), a punch and a bell;
THE CLOSE-UP (a DING! burst behind his face: the eyes pop, shrink to pins and cross, water; the face goes gray; the mouth
from a little O to every tooth; a deflating whine); out: he keels over onto his knees and over on his side, curled up
clutching it, his line; Meathead's ("BEST DOOR I EVER KICKED."). The rope's unhooked. `ct-amphi-guard` (GUARD_DOWN) in
state.stageMemo: down for good (a death, a checkpoint, the cheat past cp 61 all find him down). He groans as Meathead
goes by, now and then (fresh lines only). A revisit: still down, an ice pack on it, a line once a visit.

**STUPID DAD'S INTRO** (once a visit; a retry goes straight on): up onto the stage and THE SHOW STOPS DEAD (`tapestop`:
its music winding down; the laugh track cut; the TV rolling) and the family doesn't (they glitch). Meathead to his mark
by the TV; STUPID DAD CLOSE UP (the wallpaper banded behind him), squinting over his can, then half in character: he
thinks it's the Boy ("BOY? THAT YOU? YOU GOT BIG."); Meathead's answer; one of the family's tapes stuck ("SURE THING,
P-P-P-POP!") and the laugh track in the wrong place; he heaves himself up off the couch, his line; crushes the can on
his forehead, drops it, belches; the threat ("MARLENE! GET MY BELT!"); then he grabs the couch by its arm and drags it
up front onto the play plane, drops back onto it ("DAD FIGHTS SITTING DOWN."), the stolen mallet leaning on its arm;
Meathead's word; THE FIGHT. As the intro starts the living room's left-hand wall flies in from the grid behind
Meathead (the room shut: the fight's left lock; the right-hand wall's always there, the fridge against it). Every one
of his lines (and Meathead's) in clean / shitty / naked pools.

**THE FIGHT** (amphi/fight.ts, fightArt.ts; job 8). The user's design, VERBATIM (2026-10-20):

"he sits on the couch most of the time. a giant cartoon mallet sits there. it's not normally supposed to be there, but
he snatched one from one of the punchy and kicky animatronics to bat away annoying fans. he keeps it by him at all times
even if it isn't canonically correct. during the fight he sits on his couch yelling at his family, drunk. side note: i
hate sitcoms. a big reason why is it often just devolves to family members just being snarky and mean to each other in
the living room set the whole time. that's this show, making fun of that premise. somehow he can afford a nice house
despite the wife being stay at home and his own job being a clothing store manager. small dig on al bundy. the whole
fight he screams at his family to get him a beer. family members cannot harm you. during the fight, one of his family
members walks to the fridge, the animatronic and tosses a bunch of beer bottles at him. most miss but he eventually
drinks catches one and drinks it. attempting to get close to stupid dad will have him swat you away with the mallet,
making any charge or grab attempt potentially deadly. once again, he sits on the couch practically the whole time. one
of two things can happen when he drinks: he pukes so hard the couch flies across the set like a missile, when it hits
the wall, the fridge moves too. there are more bounces as the fight goes on but it does settle to its default location
eventually. the other thing he can do when drinking is go on a 'drunken rage'. he picks up the giant cartoon mallet like
mario in donkey kong and smashes up and down repeatedly, coming after you. he will jump randomly, making it safe to run
under him. all charge attacks are definitely off the table during this moment. charge attacks are safe if you are
skilled when he's puking and flying across the living room (like dive kicks). grabs won't work as usual. the projectile
vomit will hurt you.

his weakness is the car. firing it once will have a car auto target and kill one of his animatronic family members.
there will be a bit of a cooldown before you can use it again. he gets increasingly baffled and frustrated for every
family member you kill. the second to last one will crush his couch, forcing him to get up. his is pathetic and
uncoordinated during this phase and won't have much resistance to face here. all his drunken attacks won't go off and
neither will his hammer counter attacks. if you still have ammo for the clapperboard, one more use will send a final
stuntcar onto him, flattening him and ending the fight. he will have a normal death animation if you kill him with a non
weakness. all stuntcars are essentially a scripted homing attack that progressively destroys his tv family. the carnage
stays with each stunt car that crashes too. you need to slightly alter the mechanics of the clapperboard so you cannot
spam it either. he will do a drunken counter attack either by puking or the donkey kong hammer every time you kill a
family member."

As built (numbers up top in fight.ts):
- **On the couch** (up front, the play plane, COUCH_HOME): yelling for beer (DAD_BEER), sniping at the family by name
  (DAD_SNIPE; that one's tape snipes back, MOM_SNARK etc., and the laugh track), the Al Bundy dig (DAD_BUNDY: a clothing
  store manager, four bedrooms, a sunroom, Marlene at home; Meathead's MH_BUNDY once), taunts. Close in (in front of him
  or over his head): THE SWAT (the mallet, 22; a 16-frame wind-up, 7 at a charge, dive kick, uppercut, slide or grab
  coming in), then 40 frames winding back (open). It's an arc round his shoulder (dad.ts swatGrip: grabbed up, wound
  back over his shoulder, swung through and down out in front) and it hurts only where the mallet's head is drawn,
  swept frame to frame (fight.ts swatSweep); it starts when he's inside the head's swing (swatZone). Grabs: TOO GREASY
  (onGrab: thrown off him, MH_TOO_GREASY, his DAD_GRABBED). The family can't hurt him.
- **The beer run** (every 430-620 frames he's sat there): one of the family (the Boy half the time) jerks over to the
  fridge on its castors / post / track base (22 px every 8 frames: Gramps scoots in his recliner, Sis slides along
  cross-legged), opens it (its FETCH_TAPE), and pitches 2-4 ARMFULS (the user's: "the thrown beer fly all over, making
  any part of the stage you stand in deadly. thrown beer hurts a bit too"): each one bottle at him (short, long, off the
  wallpaper, off his head: bonk, the laugh track; the last armful's the one he catches, DAD_CATCH) and 2 more (3 once
  he's lost two of the family) flung wide all over the set, one about where Meathead's stood, each with a shadow on the
  deck where it'll come down; one that hits Meathead hurts a bit (6, m2:ct_dad_beer) and smashes on him. One he can't
  catch (busy) smashes and there's always another. Then he drinks it, and does one of the two, in turn (the first's the
  puke):
- **PUKE**: a fire hose of it the way he faces (hurts, 8 a glob); the couch rockets the other way, bouncing off the end
  walls (each bounce 62%, the slide's friction 0.972: it settles quickly, the user's); its wall jolts the fridge off it
  (it creeps back); the kick's bigger every puke and every family member gone. It settles; he scoots it straight back
  to its spot with his heels (3.4 px a frame in hops: a few seconds). The couch hurts (16) going fast unless
  he's mid-move into it (charge, dive kick, uppercut, slide: the skilled way).
- **DRUNKEN RAGE**: up off the couch, the mallet in both fists, Donkey Kong: a 14-frame swing (up over his head, held,
  slammed down onto the deck out in front in 3, held: dad.ts hammerGrip, leaning into it), after him at a stagger,
  hopping at random (10.5-12.5 up: run under him). THE TELL: his knees bend for 16 frames before each hop (he slows),
  and give as he lands. The hammer (18) hurts where its head is drawn (this frame and last: no tunneling), and his body;
  no move lands (touch: hammered instead); only what's fired at him. 7 s, then winded (a wheeze: open), and he shuffles
  back to the couch.
- **Hurting him**: 666; the ray gun 25 and his moves (35 / 50) in full; anything else 35%; the 60-frame breather.
- **THE WEAKNESS: the clapperboard** (weapons/stuntCar.ts setStuntCarHook: this fight's say over it). Each snap (the
  clap, the ammo used) sends ONE stunt car, scripted, homing on the nearest of the family to Meathead: the flip, the
  fireball, the animatronic flattened (knocked flat, powered down, its bits round it: an eye, the wig, a hand on its
  wires, Mom's casserole), the wreck left on its roof burning then smoking for good, the stuntman flung into the
  wallpaper (his splat stays, him in a heap under it). The scene then takes 7 s to reset (RECHARGE; NEXT TAKE on his
  bar, only if he's got the clapperboard): a snap before then is a dud ("RESETTING THE SCENE", MH_DUD). Elsewhere the
  clapperboard is unchanged. Each kill: the dying tape (DIE_TAPE), the laugh track, him baffled (hands on his head;
  DAD_KILL by count, more fed up each time), then his counter (puke or the hammer, in turn). The third (second-to-last)
  car hops off its wreck onto the couch and crushes it: he's thrown off, up for good, PATHETIC (no couch, no beer, no
  puke, no hammer, no counters; double damage, half the breather; staggering after him, swinging at air, falling on
  his face, trying to lift the mallet he drags and toppling). The fourth takes the last of them (DAD_KILL, no counter).
  The fifth comes down on HIM: the weakness death. No car, crash, wreck or flung stuntman ever touches his health
  (the cars only go for the family); once the family's all gone and the couch is crushed (him up, flailing), ANY hit
  from any weapon or move kills him in one, whatever his health (fight.ts doomed()). Meathead's hint (only if he owns the clapperboard): a non-plain hit
  now and then before the first car (MH_HINT).
- **The weakness death**: the kill cam (slow-mo, zoomed, Steve's); the car on him, burning; it tips off him (away from
  Meathead) onto its roof; he's a pancake on the deck; he peels up off it, a squat paper-thin man wobbling in the draft
  (the cartoon's accordion squash), the stuntman up out of the wreck with a thumbs-up, the laugh track; DAD_FLAT; over he
  goes like a sheet of paper; MH_WON_WEAK.
- **The standard death** (the user's, 2026-10-20: "he goes to the fridge and it just wobbles then falls on him, crushing
  him to death"): FINE, I'LL GET IT MYSELF (DAD_FRIDGE). Up for a beer at last, he shuffles to the fridge (Meathead walked
  back out of the way) and yanks on its stuck door; it rocks off the wall toward the front, wobbles on its corners, the
  bottles inside clinking (DAD_WOBBLE: UH OH), he throws his arms up, and it tips over on him about its near foot: CRUSH,
  flat under it on his back, his head and his hands out the end, twitching; cans burst out across the deck; the laugh
  track; blood out from under it, and he shits himself (the fart, the seep, DAD_CRUSHED); one can rolls out across the
  deck to Meathead's feet and cracks open on its own; MH_WON. (The user's, 2026-10-21: "move all props so they aren't in the way and make sure
  the fridge is shut. it opens and spills tons of beer bottles when it topples on top of him": as it starts the family
  left standing backs off to the far left of the set, the wrecks and the dead ones slide clear of his walk and the
  fall, the puddles go; the fridge is shut (bulging) all through the yank and the wobble, and as it lands the door bursts
  open and 70 bottles and cans pour out both ways (mostly away from his head), bouncing, clinking, foaming, none coming
  to rest over his head.)
- **Not sedentary (the user's, 2026-10-21, verbatim):** "the stupid dad fight feels a bit too sedentary. make it so you
  cannot just stand there and shoot him. the various animatronics (the ones that are alive anyways, the stunt car will
  elimate them) will move on a set track and attempt to slap you. the beer phases should happen much more often. i'd say
  at least 5-6 times on a non weakness fight. one random family member is chosen to get the beer and they will move very
  quickly to the fridge and throw it then back to their 'default' track. zoom out so the whole set is always visible";
  "you gotta have clearance for stupid dad, if an animatronic is in the way, it will eat the shot. they can only be
  destroyed with the stunt car. meathead will say 'what kind of bullshit titanium are these robots built with'"; "slightly
  reduce the smacking range of the mallet when close"; the clapperboard on cooldown: "give a reason why it's taking a
  while and show a little cooldown above his head when equipped. like 'the new drivers are slow as shit'". As built
  (fight.ts TRACKS etc.):
  - THE FAMILY ON TRACKS: each living one patrols its stretch of the very front of the set (drawn in front of everything
    on it): MOM the left end to 3210, SIS 3110-3500 (across the couch), THE BOY 3420-3760, GRAMPS 3660 to the right
    wall: overlapping; 10 px a jerk every 6 frames, stopping 40-80 frames at each end and now and then on the way. THEY
    NEVER HURT HIM (the user's, 2026-10-21, later: "the robots don't hurt you anymore but they do obstruct your shots.
    same for beer runs"): the slap they had for a day (a bolted-on slap arm) and the beer runner's ram are gone, their
    hurt lines dropped from the pools (the clips stay in the pack).
  - CLEARANCE: the living ones (not the one off on the beer run) eat his shots (every player projectile that touches one)
    and his moves into Dad when one's between them: a clang, sparks, nothing to it or to Dad; after every 3 eaten (7 s
    apart at least) his gripe, MH_BLOCKED ("WHAT KIND OF BULLSHIT TITANIUM ARE THESE ROBOTS BUILT WITH?", the user's,
    first in each pool, and similar). Their patrols open and shut the windows; Sis sits low (shots over her).
  - THE BEER RUN, MORE: he calls for one every 300-420 frames he's sat there (the couch within 40 px of its spot): ONE AT
    RANDOM of the living rushes to the fridge (9 px a frame, sparks off its wheels), throws 1-2 armfuls (one at Dad, 3
    more anywhere, 4 once two are gone), rushes back to the nearest spot on its own track: about every 13-15 s of a
    fight, 5-8 over a non-weakness one. None once they're all gone.
  - THE CAMERA: zoomed out to 0.66 on the middle of the set through the whole fight (and the standard death), wall to
    wall, his feet low on the screen; the whole view's the screen for the rules (viewIsScreen); the art culls to the view
    (state.view). The words over everybody and the walkie's are drawn on the HUD at full size. The weakness kill cam
    zooms in as before; after it's all over the zoom eases back in.
  - THE SWAT, SHORTER: the mallet's arc pulled in (radius 40 to 34 by the end of the swing) and the head driven down into
    the deck (the wrist snap 0.25 to 0.55 rad): about 15% less reach out in front, still exactly where it's drawn; the
    trigger pad round its swing 24 to 16 px.
  - SOLID, HARMLESS (the user's: "the robots cannot be pushed either"): they're not the engine's enemies at all (nothing
    pushes, grabs, flings or blows them about); a charge, slide or dive kick into one stops dead and bounces him off it
    (a clang, the gripe count). Touching one never hurts.
  - THE BEER RUNNER: a tell first, 34 frames (a klaxon, it leans the way it's going and revs, sparks at its wheels),
    then it bolts there and back, straight through him, harmless. To keep him moving now the family's harmless, two of
    each armful's wide bottles come down about where he's stood (was one).
  - THE HAMMER, TIGHT (the user's: "the 'donkey kong' attack seems to hit you when you're near him but not touching him.
    the hurt box seems oversized"): the head's hurt is the drawn barrel exactly, turned with the mallet (a separating-
    axes test against his body box: no padding, no box round a tilted head), checked at this frame's swing and, only
    while it's moving, the in-betweens since the last (held up over him or held down on the deck it's only where it
    is); his body 34 px wide, shoulders to feet (was 48 wide, his whole height); the enemy box he's touched by 44 x 92
    (was 56 x 96). The swat uses the same exact head.
  - THE CLAPPERBOARD'S RESET: snapped before it's ready (a dud, no ammo used): the stunt coordinator on the walkie
    (m2.hollywood.stuntco, off-stage; WALKIE: under the boss bar) with an excuse (CREW_EXCUSE: "THE NEW DRIVERS ARE SLOW
    AS SHIT." word for word, the union break, a car that still runs, the driver who quit, insurance, the stuntman
    throwing up...), at most one every 4 s however it's mashed. With it in his hand, a little clapperboard by his head
    (to the side, clear of his speech) in a ring filling as the scene resets; READY! and a clap when it's done.
- **His hurt lines** (lines.ts HURT_BY): every source names what it was (the drunk's swat, Donkey Dad's hammer, the
  puke, the couch, the family's beer bottles), each in clean / shitty / naked pools, hurt callouts and death screens
  (fight.ts hurtSrc sends `<source>.<state>`). (The user heard "bonked by a mouse" off his swat: the old pool's lines
  are gone.)
- **His look** (dad.ts): two-bone arms (elbowOf: the hand pulled in to his reach, the elbow worked out from it, bending
  down and back when the hand's low, forward when it's up), a round at the shoulder and a wrinkled knob at the elbow;
  bare knees out of the boxers' cuffs (kneecaps, drawn again over the gut when he's sat so they stick out past it). His
  close-up in the intro is a gross-up (dadGross.ts: painted per pixel like Piper's: the liver-spotted dome, comb-over,
  creased forehead, wild brows, bloodshot yellowed eyes with crust, a purple strawberry nose with pores, blackheads, a
  wart and nose hair, broken veins, stubble with a follicle under each hair, beer foam on his lip, yellow teeth, the
  headset mic; a fly, sweat, drool and foam live). The signs (posters, billboard, gate, store, mural, the portrait on the
  set: bigkid/art.ts dadArt) draw his fight model on a short couch (dad.ts drawDadSign). The TV's cart: as wide as the
  set and painted live (a stamp at the TV's depth came down off to one side, so the set hung off its shelf).
- Both deaths are cutscenes (no input, no HUD, SKIP >> all or nothing). Then VICTORY, the walk-away (walkAway/
  stupidDad.ts: the band shell, his cans and cups down the path, the foam finger; the weakness leaves the last stunt car
  dumped on its roof by the walk and half his couch, the other way more cans; the MALLET), the hub, Cartoon Land
  cleared. Revisits: the stage empty, the family slumped and dark, the TV off, the bleachers empty but for the one
  asleep, the guard with his ice pack.
- **Checkpoints**: 62 (STUPID DAD: set as the intro starts; manual). The user's rule for every boss (2026-10-20): dying,
  he's back OUTSIDE the boss door (cp 62 is at the foot of the stage steps, by the guard he kicked), and walks up onto
  the stage himself; the intro's skipped then (once a visit): the couch is already up front, him on it, the left wall
  flies in behind Meathead as it starts (DAD_ENTRANCE, 90 frames before he swats). No mid-fight checkpoint. The boss
  door (the guard's nuts) goes off only once he's walked right up to the guard himself (no walking him into it).
- **Music** (boss:stupid-dad, cues.ts stupidDadArr by amphi/index.ts stupidDadMusic): hush and intro through the intro
  as before; main for the drag and the fight; intro again (no drums: deflated) once he's up and pathetic; hush for
  his death.

**His lines** (amphi/lines.ts): arrival and revisit; the beer stand, the crowd, the show (the first "BOY! BEER!": "I SAW
THIS SHOW. EVERY NIGHT. AT MY HOUSE."), the robots; the kick, the intro; the fight (the hint, too greasy, the first
puke, the first rage, the dig, each kill, the couch, the dud, both wins). New hurts (lines.ts HURT, each with death
screens): `m2:ct_dad_swat` (the mallet), `m2:ct_dad_puke`, `m2:ct_dad_couch` (the flying couch), `m2:ct_dad_hammer`
(the rage).

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
- (job 6) PUNCHY & KICKY is built (itchy/; see Section 6 above). The park's machinery (the gantry's anvils, the
  KILL-O-RAMA's hammers, the fuses, the cannons) runs as a show on a loop while he's about it (one clock per set piece,
  so the pairs keep their turns); the props are one-shots or the cast's. Hazard zones keep the cast out of the active
  ones (falling, swinging, burning, flying), but not out of the rakes and the bear traps: they walk into those
  themselves (the cartoon gag), and fall in the stagehands' holes.
- (job 6) Checkpoints restore the world as the run left it (`ct-itchy-fired` in state.stageMemo: the safe and the piano
  down for good, each sprung bear trap, the host's anvils where they came down, the last six). The gantry's anvils and
  the hammers' heads come and go with their cycle. Every block a hazard puts down (an anvil, a hammer's head, a wreck)
  waits till he's clear of it: he's never shut in one.
- (job 6, changed by the user's notes) The canyon and the set's floor of portable holes kill him (their own kill cams,
  itchy/deaths.ts, death screens by the state of him; with the cheat's god mode, back where he last stood safe); the
  cast go down for good in the canyon and drop out of a hole over where they were put on the set. The stagehands' own
  laid holes keep the cartoon rule: he drops out of one up in the air over where he last stood safe and lands on his
  head (hurt on landing).
- (the user's notes) The rakes and the bear traps have their own hurt animations (src/m2/hurtGags.ts, shared with
  Wilderness Land's bear traps): the rake's handle WHACKs him in the face (stiff as a board, rocking on his heels, the
  handle's print down his face, teeth out, X-eyed, stars and a birdie; held under half a second); the bear trap's jaws
  on his boot, the chain to the stake pulled taut, hopping and howling as long as it holds him. Their lines by the state
  of him (`_shitty`, `_nude` sources). The rakes are drawn big and bold to read at a glance (the fat bright handle, the
  red tape, tall lit tines, a glint running along them). The GENERIC-CO labels stay clear: the warehouse sign moved left
  of the dock crane's mast, the crates' names on pasted paper labels over the brace (two lines on the narrow ones).
- (job 6) Deaths: the anvils, the hammers, the safe and the piano flatten him (the engine's `flattened`); the TNT and the
  thrown dynamite burn him black (`burnt`); the rest, he comes apart. Every hazard and attack its own hurt pool and death
  screens (lines.ts HURT).
- (job 6) Revisit (`ct-itchy-done`, set going out the far gate): the KILL-O-RAMA's marquee says TODAY'S SHOW: CANCELED,
  CLOSED FOR CLEANUP hangs on its chains, the robot Kicky's head hangs off by its wires, sparking (it still swings); his
  arrival line is the revisit's. Back from the amphitheater he's at DOORS.itchy.end (the default: in the way on). The way
  on is the crude right-end exit under the STUPID DAD LIVE! gate (job 7 can swap it).
- (job 7) STUPID DAD LIVE! is built (amphi/; see Section 7 above). The way in is unchanged (itchy's right-end exit to
  DOORS.amphi.start); the way back out the left end to DOORS.itchy.end. The bowl is a ground profile (concourse, the
  aisle as the engine's stairs, 24 steps; the pit; the stage steps, 5; the deck), the art lighting each tread where
  terrain.ts puts his feet.
- (job 7) The boss door is a cutscene, the other lands' door kick on the guard (kickPose), with a screen-space close-up
  of his face the way Piper's reveal does hers. He's a wall till kicked; GUARD_DOWN (`ct-amphi-guard`) keeps him down
  through deaths and checkpoint starts (any start at cp 61 or later sets it).
- (job 7) The show's lines (STUPID DAD before he's seen Meathead, the family's tapes) are one pool each (they don't react
  to him: the narrator's precedent); everything STUPID DAD says from the intro on is by pants. No new line starts while a
  scene's on (the show holds); the intro freezes it.
- (job 7) The set faces the camera (the sitcom's living room as the side-scroller sees it; the bleachers face the stage
  from the left): the couch, the family, the TV stand back at their own depths, not on the play plane (nothing on stage
  to stand on but the deck yet: the fight's design will say what's furniture to jump on).
- (job 7) THE PLACEHOLDER (gone: job 8 replaced it with the fight). markBossFight ('stupid-dad') runs through the intro
  and the fight. Checkpoint 62 (STUPID DAD, manual, clear) is set as the intro starts.
- (job 8) THE FIGHT (amphi/fight.ts, fightArt.ts; see Section 7). Decisions where the user left it open: the couch is
  dragged up front onto the play plane at the intro's end (he fights sitting down, where Meathead can reach him; the
  family and the TV stay back at their depths); the living room's side walls bound the arena (the right one always,
  with the fridge against it, a little back; the left flown in from the grid as the intro starts, so nothing pops in);
  the clapperboard's no-spam change is this fight's only (a 7 s reset between takes, a dud before then; a hook in
  weapons/stuntCar.ts, setStuntCarHook / snapClapper; everywhere else it's unchanged); "grabs won't work as usual" is
  TOO GREASY (beer sweat) like the pundits; charge attacks in the rage get him hammered (every move into him, from any
  side or above); the puke is a fire hose the way he faces; the second-to-last car crushes the couch on its way (a hop
  off its wreck), the last of the family can still be flattened in the pathetic phase (no counter), and then the last
  car is for him; the pathetic phase does no damage at all (him swinging at air) and takes double; the bottles never
  hurt; the standard death is ours (the SWILL LITE avalanche, he shits himself under it, the can rolled to Meathead's
  feet). Hurts: m2:ct_dad_swat, _puke, _couch, _hammer (lines.ts HURT, voiced). The enemy's kind m2:ct_stupid_dad
  (midBoss: no instant kills or status effects from the other weapons; touch: the rage's counter; onGrab: too greasy).
- (job 8) Outside src/m2/cartoon: weapons/stuntCar.ts (setStuntCarHook, snapClapper; drawStuntCar, drawStuntman,
  STUNT_PAINT, STUNT_CAR_SCALE exported for the scripted cars), music/cues.ts (stupidDadArr: the fight's moods),
  walkAway/stupidDad.ts (the weakness's wreck and half couch, more cans otherwise), kinds.ts (registerHurtLines'
  dev-only death-text check reads `import.meta.env?.DEV`, so the voices tool can bundle it in node again).
- (job 7) New sounds (m1 sfx.ts + types.ts SoundType, appended): `laughtrack` (a canned studio audience), `canopen`,
  `tapestop`. New voices (cast.json): m2.cartoon.bouncer (the guard; the studio's m2.cartoon.guard is another man),
  dad, tvmom, tvboy, tvsis, tvgramps (radio: the tapes). The walk-away (walkAway/stupidDad.ts) has the band shell behind
  him and his cans down the path (and how he died: job 8).
- (SNES pass, the kiddie square) Sillyville is drawn to one eye (kit.ts's SNES kit: candy ramps, rampH, still /
  stillAt / seen, sideBack with a `bow` so a bulging cartoon wall's side bulges with it all the way back, topBack,
  drumTop, ballR / eggR, shadeAcross, bandsDown, candyStroke; FRONT_D 0.88, BACK_D 0.78; other sections can use it).
  The far off is cached per hour (kiddie/far.ts: the sky, Seuss clouds, the patchwork hills, the water tower over the
  park, the rest of Cartoon Land: the studios' stages, the WACKY WHITE HOUSE and STUPID DAD billboards, the KILL-O-RAMA
  pylon, the big-kid zone's bolt, Hurl-A-Whirl, halfpipe and pod, STUPID DAD LIVE!'s band shell; the square's own
  roofs). The square's fronts stand at FRONT_D with curvy sides (kiddie/fronts.ts: shops with their goods, names,
  awnings, round windows, drooping roofs), the garden alley behind, the candy pavement and the street's furniture
  (Truffula trees, curly lamps, benches, the balloon post, popcorn, the hippo bin, planters, topiary; none in a pit or
  where a set piece's sides run back). The play plane's set pieces got their sides and tops going back; the ground
  and the pits' near halves are scanline-bent. toonSign, the water tower (monument.ts), the stack-towers (sway.ts; a
  `pit` flag skips the hummock) and the walk-in are SNES'd for every section that uses them. Drawing only, except:
- (SNES pass) THE REVISIT (`ct-kiddie-done`, state.ts `shut()`): the rides are shut down for the day: nothing runs
  or hurts (the carousel stopped, its lights off, a CLOSED board off its rounding board; the fish down, CLOSED FOR THE
  DAY, the goldfish belly up; the train parked behind its hedges, NO MORE TRAINS TODAY; the trolley put away, the
  shutter down across the hattery's arch, OUT OF SERVICE). The shops' cards say CLOSED; the balloon post's bunch is
  popped, skins in a Truffula, scraps and confetti on the ground. The ball pits and the cast are as ever.
- (SNES pass) THE STUDIO (studio/): its own kit in studio/paint.ts (six-step materials: fake-wood paneling, walnut,
  cork, beige plastic, steel, institutional block, egg-crate foam, velvet and blackout drape; CRTs, fax machines, desk
  phones, water coolers, filing cabinets, ficus, wall clocks, motivational posters, pinned sheets, troffers), the rooms
  in studio/rooms.ts (every wall full: the lobby's Memphis wall, TV bank and the square through the doors by the hour;
  Dave's walnut shrine, lit portrait, awards cabinet, TV GUIDE cover, VISION poster; the writers' whiteboard, episode
  cards, TEAMWORK, Nerf hoop, TV cart; storyboards in sequences with red yarn; headshots, bass traps, the booth's
  reel-to-reel and waveform CRT; the pegboard and STAY ON MODEL!; Overseas' night city with its tower, radiators, coats,
  family photos, the kettle, AIR FREIGHT boxes; ink and paint's color chart and smocks; the camera room's drapes and
  can racks; the premiere's velvet swags and WORLD PREMIERE), the people in studio/people.ts. The drop ceilings' troffers
  light with their room; each room its own floor going back. The path's theater carpet; everything he stands on lit
  along its top. The staff's coffees and plates are drawn in flight now (they weren't), the puddles steam. No layout,
  timing or lighting logic changed (two small soft accents added: the lobby's TV bank and EXIT sign).
- (SNES pass) THE BIG-KID ZONE (bigkid/): one eye (kit.ts). The far off cached per hour (bigkid/far.ts): a hot 90s
  sky banded to a peach blush, stepped cumulus and jet streaks, the park blimp (CARTOON LAND, trailing SEE STUPID DAD
  LIVE!, live), the suburbs past the berm (hazy hills, a radio mast, the interstate on its viaduct with billboards and
  cars, VIDEO BARN's strip mall, cul-de-sacs), the water tower, the rest of Cartoon Land (Sillyville's domes, the
  studios, the cartoon White House with Socks, the KILL-O-RAMA pylon, the bone arch, STUPID DAD LIVE!'s shell, a
  STUPID DAD billboard CANCELED), the zone's own roofs with their giant props (soda, pizza, hi-top, boombox, the
  tipping slime bucket, the inflatable Rad Rat, a Gloppy statue, neon bolts, dishes, water-slide tubes, a giant board,
  light towers). The zone's show buildings stand at FRONT_D, boxy and straight, sides going back (bigkid/backs.ts:
  Memphis bands, neon tubes, tags, posters; GAME ZONE, SLIME TIME SNACKS, PIZZA PIT, RAD RAT'S SKATE SHOP, RIDE PHOTOS,
  RESTROOMS (DUDES / BETTIES), LOCKERS, T-SHIRTS, OUCH! first aid, show buildings), the alley, the skate-park concrete
  going back (cut short at the pits' rims, the pipe and the rink), the furniture (neon lamps, GLOP IT! bins, soda
  machines, picnic tables, palms, payphones, souvenir carts, queue rails with seeded crowds, benches; none where a set
  piece's sides run back). The set pieces got sides and tops going back (the gates, the garage and COUCH FUEL's pump,
  the newsstand, the shelter, the STUPID DAD STORE and its standee, the memorial wall and stone, Giggles' booth, Drake's
  quonset, the halfpipe's curve, back wall and coping); the rink's floor, back fence (scoreboard, crowd) and canopy
  grid go back to the eye; the glop pits go back to a railed rim (NO LIFEGUARD. EVER); the ground's slabs and the
  slime are scanline-bent. dadArt and poster are stepped now (itchy/ and amphi/ use them too). The rides are drawn in
  bigkid/rideArt.ts (stamped per hour, moving bits live); the towers in the pits are flagged `pit` (no hummock; glop
  heaped round them). The cast: Gloppy stepped (wet sheen, bubbles, the zip, googly eyes, his dropped top when dead),
  the ride op's belt, walkie and visor, Rad Rat's tail, the Flea's emblem, the churro cart's churros. Drawing only: no
  layout, timing, hitbox or lighting-logic changes.
- (SNES pass) THE WHITE HOUSE, PART ONE (whitehouse1/): its own kit in whitehouse1/paint.ts (six-step marble, gilt,
  velvet, navy, oak; wobbly Ionic columns, pilasters, crown moldings, wainscots, wallpapers, gilt frames, the
  presidents' cartoon portraits (Washington, Lincoln, Teddy, Nixon, Taft, JFK, FDR, Jefferson, a First Lady, the
  beagle) hung a hair crooked, the Seal, sconces and chandeliers with live candle flames, swagged drapes, windows onto
  the grounds by the hour, doors, a fireplace with a live fire, busts, flags, the grandfather clock's pendulum), the
  rooms in whitehouse1/rooms.ts (each back wall painted once for the hour; ceilings coffered and floors patterned going
  back to the one eye: the Seal inlaid in the Entrance Hall's marble, the Cross Hall's runner, parquet, rugs; the brick
  cutaway above the ceilings; the ground floor's doors under the second floor, the house's south front under the
  balcony), the far off past the balcony in whitehouse1/far.ts (cached per hour: cel cumulus, the show's Washington
  (the Monument, the Jefferson Memorial, the Capitol, the Old Executive Office Building, the Treasury), the Ellipse,
  the South Fountain, the fence and its tourists). The play plane in steps, its tops going back, lit lips kept (the
  Steinway, the gilt chair stack, the risers, the podium and its Seal, the press gallery's ledges, the sideboard and
  the banquet table, the stairs' runner and dimmed banister, the Lincoln bed, the bench and the rose arbor); the South
  Portico, hedges, crabapples and the West Colonnade behind the garden. The Hoover, the chandelier, the ball return and
  balls, the roses and sprinklers, the throws, the puffs, the pundits (Perot and Falwell at Stupid Dad's grade: their
  ramps, dithered seams, the show's fat outline), Chelsea (stepped curls, headband bow, braces with pink bands, plaid,
  Mary Janes), the animator's hand (cuff, watch, the eraser's worn end, the inking pen), the mean men's details
  (argyle, lapel pins, a wad of bills) and the blimp redone; the cat's form polished (no proportion or frame changes).
  THE REAL STAGE (whitehouse2/realStage.ts, shared by both halves): the soundstage's far wall (fly gallery, pin rail,
  DOCK 3), velour legs, the box-truss grid with par cans, lekos and hung VIDEO-MAX projectors, the floor's cables and
  spike tape, the flats' backs (frames, toggles, corner blocks, the cartoon paint bled round the edges, jacks with
  sandbags and stage weights), the wings' truss towers, road cases, the mean men's costume rack, craft services and the
  director's chair, a ladder; the plywood, plank and scaffold play plane stepped; the front row's velour. Perot's and
  Falwell's actors redone more specific and gruesome (bodies.ts), and the henchmen's actors leave their effects in the
  blood (the goon's snapped shades, the lobbyist's burst briefcase of red-soaked bills, the pollster's clipboard and
  crushed glasses). Drawing only: no layout, timing, hitbox or lighting-logic changes.
- (SNES pass) THE WHITE HOUSE, PART TWO (whitehouse2/): on part one's kit (whitehouse1/paint.ts) and its rooms'
  approach: the West Wing's rooms in whitehouse2/rooms.ts (each back wall painted once for the hour; ceilings coffered,
  drop-tiled with fluorescents (the offices, the kitchens) or dark with spots (the Situation Room); floors going back to
  the one eye: carpet, checker, rugs, the raised floor's tiles; the brick cutaway above; doorways with the next room lit
  through them), every wall full: the offices (binders, the water cooler, desks of beige computers, the corkboard, blinds
  onto the grounds, the copier, the fax spitting paper, DAYS WITHOUT A SCANDAL: 0), the Roosevelt Room as the EIB studio
  (Teddy over the fireplace, the moose, the producer's booth, egg-crate foam, the banner, ON AIR live, gold records,
  TALENT ON LOAN FROM GOD, the DITTO LINES lit), the kitchens (tile, the fridge with Socks drawn on it, cans, the hood,
  the utensil rail, the menu, the sink, a mop), the Cabinet Room (French windows in gold swags, the fireplace and eagle,
  portraits, a bust, the flags), the Map Room (oak, the war map's pins and yarn to MEAN MEN HQ?, FDR, a ship's wheel, a
  telescope, a compass rose), the Situation Room (the monitors live: radar, blips, MEAN MEN ALERT crawling, the big
  screen's TARGET: SOCKS; DEFCON 1; the world's clocks; the hotline; the beacon), the Outer Oval (the secretary's
  desk, the grandfather clock, the Oval's door under its eagle); THE OVAL OFFICE the grandest: its walls curving round
  to the one eye (niches of shelves, a door each side, sconces), three tall windows onto the Rose Garden in gold drapes,
  the flags, the credenza's photos (Socks's among them), the ceiling's plaster Seal, the oval rug with the Seal going
  back. The West Colonnade out of doors on part one's far (whitehouse1/far.ts): the Residence's west end, crabapples and
  magnolias, hedges and beds of tree roses, the lawn in mowed stripes, the colonnade's Doric run and lanterns (lit after
  dark), the West Wing's end wall going back (a French door out, the office's paper in). The play plane stepped, tops
  going back, lit lips kept: the filing cabinets (government steel, label cards, the drawers' manila folders), the EIB
  desk (its board, a DITTO mug), the studio shelves, the jelly mold (lime in steps, fruit set in it, the cherry), the
  range (stainless, the oven windows, the burners' rings and stepped fire), the pot rack (copper on chains), the cabinet
  table (mahogany, the chairs' backs dimmed, name plates), the globe on its carved stand (its continents turning, the
  brass meridian; split: hollow halves), the library step, the map chest, the footstool, the lasers (dark housings,
  stepped beams), the Resolute desk (the Seal on its kneehole, THE BUCK STOPS HERE), gilt shelves (books, a model ship, a
  bust); the Oval's far wall the house's brick, cut. Limbaugh, Dole and Newt at Perot's and Falwell's grade (part one's
  toon kit: ramps, dithered seams, the fat outline; Limbaugh's double-breasted strain and paisley, Dole's crease, cleft and
  pen, Newt's curls), their throws and puffs; the spin doctor (pinstripes, pens, a head mirror; the whirl stepped, press
  releases flying) and the dittohead (the radio's grille and dial, DITTOS, a belt) detailed, the sound wave stepped.
  The finale: the Clintons' TV (telescoping arm, wood cabinet, dials, rabbit ears, the UN emblem and flags, scan lines;
  Bill and Hillary on the toon kit), the cloth's hem and grommets falling, the actress (a grown woman in the costume, the
  wig half off its pins, her own hair under its cap, the mascara run) in real ramps. The real stage, part two: the
  VIDEO-MAX 3000 on its truss tower (sandbags, a safety chain, the cable snake; three lenses, cracked and smoking when
  blown), the stage door (wired glass, push bars, the call board and sign-in sheet, the extinguisher, a crew jacket, the
  EXIT lit), the stunt trampoline, dead gas rings and a tank, the laser rig's tripods, the fiberglass globe's halves; the
  bodies (bodies.ts, painted once): NEWT flayed (ribs, the belly's rows, finger bones, lidless eyes, both rows of teeth,
  the tie still knotted round the bare neck), LIMBAUGH hanged off the boom stand by his mic cord (the ON AIR light lit,
  the fat suit slashed to its foam, the rubber head on the desk, the cigar smoking), DOLE across the table (the skull
  split round the pineapple, the buttons bleeding through his shirt, the pen in his fist); the spin doctors' and
  dittoheads' actors leave their head mirrors, press releases and smashed radios in their blood; the actress's wig and
  mess redone. Drawing only: no layout, timing, hitbox or lighting-logic changes.
- (SNES pass) PUNCHY & KICKY (itchy/): one eye (kit.ts); the show's paint box in itchy/paint.ts (six-step blood, gore,
  bone, mustard, tar, cream, ginger, mousey, plywood, crate, concrete, steel, rust, velour; stepped splats, drips off
  ledges, cartoon bones, skulls, chalk outlines, riveted plates, planks, hazard stripes). The far off cached per hour
  (itchy/far.ts): a hot blue sky down to a coral blush, stepped cumulus with a skull cloud and a bone cloud, a red
  biplane towing PUNCHY & KICKY: NOW 40% MORE KILLING! (live), past the berm the hills, pylons, the GENERIC-CO plant and
  its smoke, a drive-in, a cemetery knoll, a quarry; the water tower; the rest of Cartoon Land (Sillyville, the
  studios' logo, the White House with Socks, the big-kid zone's Hurl-A-Whirl, halfpipe, Rad Rat, bolt and slime bucket,
  STUPID DAD LIVE!'s shell, the UBX AMPHITHEATER sign, the beer garden, a STUPID DAD LIVE! TODAY billboard, the
  KILL-O-RAMA pylon, a gift dome); the knockoff's own roofs dripping blood with the show's giant props (a mallet
  driven in, an anvil through one, a cleaver, the skull water tank, the inflatable Punchy X-eyed, Kicky's ears, a
  dynamite chimney, crates, the KILL-O-COASTER's loop, searchlights, bones, a plunger), a fence of bones. The street
  (itchy/backs.ts): the show's buildings at FRONT_D with sides going back (red, mustard, black, bone stucco; candy
  stripes or painted bones; murals; posters; water tanks, fire escapes) and a business each (PUNCHY'S GRILL, KICKY'S
  CHEESE HUT, FIRST AID: WE'VE SEEN WORSE, TOMCATS / LADY MICE, WHACK-A-MOUSE, PHOTO WITH PUNCHY, the STAGE BLOOD
  DEPOT, CAST ONLY, ANVIL TOSS, LOCKERS); the alley; the cream pavers back to the eye (paw prints, splats; painted dirt
  over the canyon back to the gorge's far rim, the stage's black boards and spike tape on the set); the furniture (FEED
  KICKY bins, bone benches, queues of seeded guests in P&K tees, cat ears and SPLASH ZONE ponchos, CHERRY GORE
  sno-cones, a balloon seller, the head-hole board, the topiary, the gnome with the axe in his head, hydrants,
  payphones, poster kiosks, red trees in skull planters). The set pieces stepped with sides and tops going back: the
  bone arch, the merch stand and the jumbotron on its lattice truss (speakers, the CRT's corners), the KILL-O-RAMA
  (stone blocks, merlons, slated cones, pennants, gargoyles, the skull keystone, chained doors, the ticket window,
  bulbs), the GENERIC-CO warehouse (ribs, stains, roll doors, the forklift, 0 DAYS WITHOUT AN ACCIDENT), the big top
  (stripes shaded round, valance, guy ropes), the blast wall (dithered scorch, rebar, the bunker slit, sandbags), the
  painted canyon (a sky cyc with a face on its sun, three rows of stratified plywood mesas on braces, cactus flats,
  MOUSE MESA) at the set's depth with the gorge's far wall and banks going back, the soundstage (velour drapes, the
  house flat, a tree flat, road cases, TAPING TODAY, the grid's cans), the STUPID DAD LIVE! gate. The free-floating
  posters and the old show buildings on the play plane are gone (posters are on walls, kiosks and drapes now). The
  play plane: cream pavers scanline-bent with chalk outlines, splats and paw prints, its blood-red edge lit along its
  top; the lawn; the rim rocks and the set's crate steps stepped; the skull lamps on bone posts. The pit towers are
  flagged `pit` (drawing only: a rock stack under each in the gorge, a lift's column under each on the holes). The
  hazards stepped (anvils, banded shadows, the gantry's lattice and winch, the animatronics big and mean: riveted
  plinths, piston knees, hoses, an open chest panel, steel jaws, glowing eyes; the hammers' barrels and hoops; rakes,
  bear traps, the crates and their red gloves, the safe, the piano, the crane, the circus cannon, the lift, the balls,
  the TNT and the fuses, the match-striking Kicky, the igniter, the holes, the blasts). The cast detailed (Punchy's
  stitches, bloodshot eye, gums, zip, tail bandage; Kicky's brows, scar, ear bandage, belt and cleaver pouch; the
  dynamite one's matchbox; the host's lapels, carnation, watch chain, skull hat pin; the stagehand's flashlight, keys,
  tape, knee pads; dead, the suit's neck ring and a sweaty performer). Drawing only: no layout, timing or hitbox
  changes (soft lamps added after dark for the street's windows and the sno-cone cart, the bigkid way).
- (SNES pass) STUPID DAD LIVE! (amphi/): sad and faded, to the one eye. Its paint box in amphi/mats.ts (six-step
  weathered concrete, bleacher aluminum, the shell's sun-faded cream and blue over gray primer, deck boards, mustard
  wallpaper, paneling, raw plywood, steel, brass, the banner's red; water streaks, peeling paint, rust runs, gum,
  cracks, marquee bulbs with the dead ones dead). The far off cached per hour (amphi/far.ts): a tired blue sky down to
  an amber blush, cumulus warm underneath, stratus lit from below, the SWILL LITE blimp (IT'S BEER. ALMOST., live);
  past the berm the hills and a radio mast, the SWILL brewery (brewhouse, tanks, the water tank as a giant can, the
  stack's steam, hopper cars), the interstate and its billboards, the strip (LIQUOR, LOTTO, BOWL-A-RAMA, PIZZA, PAWN),
  a high school's football field under its lights, SERENITY OAKS, a church, cul-de-sacs; the water tower; the park
  back the way he came (Sillyville, the studios, the White House with Socks, the big-kid zone, PUNCHY & KICKY's bone
  arch, KILL-O-RAMA pylon, big top and bloody roofs), the back lot (PARK MAINT., the SWILL LITE truck), the main lot
  and the big wheel; the grove along the park's back fence (maples and oaks, privacy slats, utility poles, the
  COSTUMES quonset). Along the bowl's far rim on the grass bank (amphi/rim.ts, 400 px stamps at depth): the RESTROOMS
  (one OUT OF ORDER), oaks (one half dead), the back of the LAWN, two PA delay towers, JOHNNY ON THE SPOT port-a-johns
  (one OCC, one door hanging), the shuttered FUNNEL CAKE trailer, the SUMMER '96 CONCERT SERIES billboard CANCELED,
  dumpsters and the UBX STAFF cart, the CAST ONLY fence, and backstage HONK's RV (a star taped on its door, a lawn
  chair, a cooler of SWILL LITE, the cord to the generator, road cases). The floors (art.ts): the bank stepped with its
  hedge; the concourse's slabs banded back with joints, gum and cracks; every bleacher row's aluminum planks back to
  the far side with its concrete riser lettered A to L, cups and cans left on them; the aisle's half steps nearest with
  yellow noses; the pit's stained concrete and drain; the stage steps as a plywood unit going back; the stage's lattice
  skirt and its deck boards with spike and gaffer tape; a floor over the eye never drawn. The light masts (lattice, two
  floods dead) and the half-dead string lights sagging between them (one flickering); the ticket booth (WINDOW CLOSED,
  turnstiles); the marquee rebuilt (barber-striped posts peeling, rust, the riveted board sun-faded, its bulbs
  chasing, the NO OUTSIDE BEER vinyl's corner come loose); the BEER GARDEN's plywood hut (the awning shaded round, the
  menu, taps, kegs under the counter, the tip jar, the vendor yawning, the neon's second E dead); the high-top's
  pitcher and ashtray; the trash can; the crowd's cushions, the cooler, the foam finger and the beer-can hat stepped;
  the folding chairs and the RESERVED card; the brass stanchions and velvet rope. The stage (amphi/stage.ts): the band
  shell's rings stepping back to its dark heart, steel ribs, bolted seams bleeding rust, peeled panels, three gone
  (the framework behind), pigeons and their streaks on the lip, its concrete pier; speaker clusters flown off it on
  chains; the banner in vinyl (grommets, wrinkles, a torn corner, PRESENTED BY SWILL LITE); the APPLAUSE box. The set
  as the cheap set it is: flats with their taped seams and raw tops, stage jacks and sandbags, the wallpaper's water
  stain and clean squares where pictures hung, the fake window's painted backyard (fence, swing set, grill, REX's
  doghouse, a crease across it), the curtains and valance, the portrait's gilt frame and black ribbon, the clock
  stopped at five over its plaque, bowling trophies, the wall phone, the dark kitchen doorway and the swing door's
  porthole, the LAFF horn bolted on top (it shakes with the laughs). The TV on its cart (wood grain, rabbit ears with
  foil, the VCR flashing 12:00), the braided rug, the Boy's bolted track. STUPID DAD polished (the can's label and
  sweat, the slippers' terry and worn toe, liver spots and hair on his hands, the boxers' fly, the headset's
  beltpack, yellowed armholes, shoulder tufts; the close-up's neckline, mustard and cigarette hole), his couch (the
  plaid's crossings, tufted buttons, the dark where his head goes, a burn, the ashtray smoking on the arm, the TV
  GUIDE, the afghan's granny squares); the family's cheapness readable (mask seams, a chip in the paint, the neck's
  gap and rod, servos showing at the joints ticking round in steps, the Boy's head hatch open with a blinking LED,
  Sis's split hand, Gramps' motor box and duct tape); the guard's cargo pockets, laces, placket, ID, and the ice pack
  in a bar towel. The cutscenes: the DING! burst stepped (rays, flash, speed lines, stars), his close-up's wallpaper
  and portrait corner, the PLEASE STAND BY card (castellations, PLUGE, a bulb-lit board, his head in a ring,
  scanlines and a roll bar). The walk-away (walkAway/stupidDad.ts): the amphitheater's concrete walk and lawn, the
  shell's rings and banner, the light masts, the rim's hedge and oaks, oaks, light posts, UBX bins, benches, and his
  cans, cups, popcorn, a program and the foam finger down the walk. Drawing only: no layout, timing, hitbox or
  lighting-logic changes (soft lamps added after dark between the string lights).
- (the user's rule change, 2026-10-20, verbatim: "the thing about the stupid dad fight is the stunt cars themselves
  won't do any damage to him unless everything else is destroyed. if everything else is gone, the stunt car will ohko
  him no matter what, even at full health. in fact, all weapons will ohko him now that i think about it. only if all
  other parts are gone and he flails around.") The cars already never touched his health (they only flatten the
  family; the fifth, once nobody's left, is the pancake whatever his health). New: fight.ts doomed() (family all down,
  couch crushed): any hit from anything kills him in one (no breather in the way), the normal SWILL LITE death unless
  it's the car. Before that the regular boss rules stand (666, non-weakness 35%, double once the couch is crushed), so
  he can still be worn down the long way.
- (the user, 2026-10-20, verbatim: "falling in the ball pits in cartoon land (or similar hazards there) won't teleport
  you but bounce you out of the pit with a dirty needle briefly sticking in you." Then: "the drawing pit also gives
  dirty needles and bounces you back up, like the ball pit"; "glop follows same rules as balls, paper earlier in the
  level".) cartoon/pitBounce.ts, shared by the soft pits: the square's three ball pits, the studio's reject pile (the
  drawing pit: paper flies) and paint vat, the big kids' two glop pits (glop splashes). Not the itchy canyon (a real
  drop) nor the portable holes. In, he sinks to the shoulders (the stuff drawn closing over him) for ~22 frames, no
  control, then he's flung up in a big arc (higher the further it is) and steered (no input) onto the bank on the side
  he last stood safe on (70 px from the lip; the other bank if there's no ground there; the safe spot only if neither):
  never the safe spot itself when there's a bank (it might have been a cel on its track or the vat's rim). A tower lid
  on the way down catches him (that's standing too). A dirty syringe (murky fill, orange hub) stuck in his ass,
  wobbling, ~2.5 s, then it falls out and clinks to the floor. Hurt 10 (×0.65 = 6.5; the old pits did 12), standard
  i-frames, the hurt sound plus a needle 'dart'. Lines (cartoon/lines.ts NEEDLE, registered in pitBounce.ts): one
  source per state of him (m2:ct_needle / _shat / _nude), so the engine's fresh-line picker and the death screen fit;
  the old per-pit sources (ct_ballpit, ct_rejects, ct_paint, ct_glop) are gone. No softlock: knocked back in mid-flight
  (or short), it's a free re-bounce; a third in a row puts him down at his safe spot. The cast knocked in: hurt 30
  (little ones die of it), then flung kinematically to the nearer bank. Nothing persists (keyed on state.stage, rebuilt
  each death): checkpoints and world state untouched.
- (the user, 2026-10-20, verbatim: "make sure the trolley in cartoon land actually goes through the tunnel. there are
  spikes on top of it, making it so you cannot ride it".) The SKY-HIGH TROLLEY (kiddie/hazards.ts): it now runs on
  till its tail's in through the end station's doorway (the tunnel mouth), drawn clipped between the hattery's arch and
  the doorway's far jamb, darkening as it goes in, the doorway's jambs and lintel drawn over it; it no longer pops out
  of sight short of the station. The "spikes" were the roof's row of separate colored blocks: now a flat striped
  canopy with scallops off its edge and a lit top lip, and the roof's a one-way ledge that moves with it and carries
  him (he can drop onto it from a tower lid and ride it over the pit; off the end it lets him down by the station). Only
  its front (the cab's nose and cowcatcher, 48 px) hurts now, so landing on it or riding it never does.
- (the user, 2026-10-20, verbatim: "the stations in the monorail in cartoon land should look better and blend in
  better with support beams and everything".) The sky trolley's line (kiddie/hazards.ts endStation): the END STATION's
  no longer a dimmed box hovering over the street. The beam's candy stripes run on into its floor, carried on two of
  the line's own curly lilac posts with a candy X-brace and bolted steel brackets; the lemon clapboard body on that
  floor under the pink-striped dome (now filled out to its curve: the old fan left dark shoulders), finial and pennant,
  round windows, lanterns at the doorway the trolley runs into, an END OF THE LINE board (NO MORE TODAY on a revisit)
  on brass rods; down its far side a caged lilac lift tower to the street, the car at the bottom. The hattery end: a
  candy strut up under the beam off a bolted plate on the wall. The studio's THIS WAY sign is drawn again over the
  station's legs (it stands in front). Collision: only the beam's last 14 px on into the doorway (a ledge), so the
  drawn beam end is all standable; nothing else new to stand on (the dome's not lit).
