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
