# Foreign Lands: the spec (Meathead 2's 5th land; for every section owner)

Read this first, then study how Hollywood Land is built (src/m2/hollywood: section.ts, geometry.ts, index.ts,
OWNERSHIP.md, and hollywood-spec.md for the standing rules) and Space Land's shooter (src/m2/space/orbit: Cuphead's
plane levels). Reuse what's shared: adventure/section.ts helpers, the time of day, signLetters, pickLine, the grab,
victory, walkAway, pathing.ts, hollywood/blvd/kit.ts art helpers.

## The user's design (verbatim, 2026-10-16)

> next up: foreign lands. we are going to go through a facsimile of various platforming sections from various countries
> of the world with costumed cast members who are obviously American and know nothing. embrace stereotypes. it's going
> to be a fairly lengthy stretch too, similar to the world showcase part of epcot. same order too. we get Mexico,
> Norway, China, Germany, Italy, Japan, Morocco, France, united kingdom and Canada. no unique mechanics here, but be
> sure to mix in verticality too, especially china with the great wall.
>
> when we get to the end, we enter a theater called "cultures of the world". this is supposed to be a stage show that
> talks about the other cultures but the PA spins it as 'cool, but not as cool as america', then lists off American
> stereotypes like 'not as cool as eating hot dogs' for example. the stage show is actually a boss battle. there are 8
> sequences with various animatronics you need to kill. one of them will be spain bullfighting where you need to kill an
> animatronic bull and bullfighter. if you don't kill it fast enough, the curtain drops and raises and shows another one
> [...]. you get limited time to kill them before it cycles to a 'living' showpiece. it will cycle back to one you may
> have done some damage to and will only cycle to 'living' showpieces. show ends when all showpieces die. there is a
> crowd watching you in the foreground the whole time.
>
> we then exit through and immediately go to an attraction called 'helicopter rides across the world'. you get on the
> helicopter and the pilot is a super nice and annoyingly progressive guy talking about 'tolerance' and crap as he shows
> you various landmarks across the world. these are replicas, but weirdly, much bigger than their real life
> counterparts. 'in America, everything is bigger'. meathead gets fed up with the pilot and goes 'shut up, hippie' and
> jacks the helicopter. this is the second half of the stage and it's a unique 'space shooter' part like future land.
>
> this is a miniboss gauntlet. the pilot - 'helicopter harry' doesn't like getting kicked out of the helicopter and
> drops the progressive facade and becomes very bigoted and swears a lot. swears a whole lot. no slurs, but says things
> like 'damn foreigner' and similar regressive things. he commands the world landmarks to turn against you. they turn
> into mechs you gotta shoot down, one at a time. all the souvenirs you fire from your souvenir launcher, like christ the
> redeemer, Eiffel tower, easter island head, etc, turn into googly eyed mechs that incorporate various bullet hell space
> shooter tactics. pressing X will fire a machine gun, Y will fire up to three homing rockets, on cooldown. B (charge)
> will tilt the helicopter blades in that direction and 'boost' into any human enemies on jetpacks it finds, shredding
> them to pieces. the helicopter always faces right. pressing left+charge will make the copter bend backwards and boost
> backwards and slice anyone to the left of it. down+charge will turn it upside-down and blend anything below it, etc.
> it goes rightside up when done. this will be similar to the genie fight in cuphead, visually in that you seem to be
> going around a large circle. upcoming landmarks can be shown in the circle as you blow up one after the other. at the
> end of the sequence helicopter harry gets angry and blasts you to the ground with a rocket launcher and then you fight
> him. i'll feed the mechanics later.
>
> i'm not very familiar with foreign cultures so be sure to fill in a lot of blanks i left.

> there's essentially two stretches: the streets and the helicopter. the helicopter ride is about half the level.
> make it about as long as previous levels too. there's fewer raw 'transitions' in this one though.
> since italy is used in the world showcase, replace the gladiator fight with something else.

## Shape and length

Two stretches, about half the play time each; the whole land about as long to play as Adventure / Hollywood Land.
FEW hard transitions (the user's): each stretch flows continuously, as one walk and one flight, with as few cuts,
fades and section doors as possible (sections exist in code, but the player shouldn't feel the seams).

1. **The streets** (the World Showcase walk, ~half): ten pavilions in Epcot's order, flowing one into the next along
   the lagoon promenade, then the Cultures of the World theater (the sub-boss). Platforming only (NO new traversal
   mechanic in this land: the user's call), but plenty of verticality in every pavilion, most of all in China (the
   Great Wall climb: watchtowers, steep stepped ramparts up and down a mountain ridge, a gate tower climbed inside).
2. **The helicopter** (~half): boarding and the pilot's tolerance tour, the jacking, then the shooter (the landmark-mech
   gauntlet round the giant circle), then Harry's rocket and the crash, then the HELICOPTER HARRY fight (the land
   boss; its mechanics come from the user later: build the arena and a clearly temporary placeholder fight so the land
   can be finished).

## Theming (every section)

Happy Land's cheap parody of Epcot's World Showcase, never its name or look: FOREIGN LANDS, "THE WHOLE WORLD, FIXED. NO
PASSPORT NEEDED. NO PASSPORT ALLOWED." (hub/lands.ts). Every country is a facade-and-plywood facsimile done by people
who've never been. The cast members are obviously American college kids in costume who know nothing about the place
(name tags: BRAYDEN, MADISON, TYLER, KAYLEE; HOMETOWN: OHIO), mispronounce everything, mix countries up, and attack him
anyway. Embrace stereotypes, for laughs, never slurs or hate: the joke is on the clueless Americans and the park as much
as anyone. Signs in each pavilion's "theme" lettering, with the park's mistakes (EUROPE'S MEXICO, A TASTE OF ASIA
(JAPAN), OOH LA LA ZONE). A lagoon along the back with a big fake fireworks barge; the promenade between pavilions.

The pavilions (fill-ins; each a section with its own cast enemies, set pieces and vertical bits):

- **MEXICO:** a stepped Mayan-ish pyramid climbed up and over (inside it: a dusk-lit marketplace plaza), papel picado
  strings, a taco cart, a fake volcano backdrop. Cast: mariachis (trumpet blasts: a sound-wave shot), sombrero
  throwers (spinning sombreros), a pinata kid with a bat; a luchador (a grappler).
- **NORWAY:** a stave church, a viking longship on a rocking wave machine (a moving platform set piece), troll
  statues, a fjord backdrop. Cast: vikings in horned helmets (wrong, they don't care) throwing axes, shield-wall
  vikings (a shielded enemy), a lutefisk sampler lady.
- **CHINA:** THE GREAT WALL, the land's big climb: steep stepped ramparts up and down a ridge, watchtowers climbed
  inside, a gate tower; lanterns, a pagoda at the top. Cast: kung fu cast members (flying kicks, they shout their
  moves), a long dragon-dance dragon (a multi-segment enemy), fireworks rockets set off at him.
- **GERMANY:** a biergarten, a giant cuckoo clock whose figures come out on a schedule (rotating platforms), a castle
  facade, pretzel and sausage stands. Cast: an oompah band (tuba blast pushback), barmaids with a fistful of steins
  (thrown), a lederhosen slap-dancer.
- **ITALY:** Venice: canals with gondola platforms, a Doge's-ish palace, a little leaning tower climbed. Cast:
  gondoliers swinging poles, pizza tossers (spinning pizza projectiles), an opera singer (a shattering high note), a
  nonna with a wooden spoon.
- **JAPAN:** a five-story pagoda climbed floor by floor, torii gates, a koi pond, a vending-machine alley. Cast: ninjas
  (smoke bombs, they blink about), a sumo wrestler (a big shove), a samurai (pointy: punishes the charge, KindDef.pointy),
  an anime cosplay kid.
- **MOROCCO:** a bazaar of tiled arches, rooftops and hanging carpets as platforms (just ledges, not flying), a
  minaret-ish tower. Cast: carpet salesmen (rolled carpets as rams), a snake charmer (the snake strikes), a spitting
  camel, a hookah-lounge guy blowing smoke clouds.
- **FRANCE:** a Paris street, a cafe, an Eiffel-ish tower base climbed. Cast: mimes (invisible walls that block shots
  till broken), snooty waiters (thrown plates and wine), baguette swingers in berets and stripes, a can-can line
  (kicks), a smoker who's rude to him.
- **UNITED KINGDOM:** a London street, red phone booths, a double-decker bus, a pub, fog. Cast: royal guards in
  bearskins (unflinching: no reaction till shot, then they hit hard), soccer hooligans throwing pints, a tea lady, a
  bobby with a truncheon.
- **CANADA:** a Rockies backdrop with a waterfall climb, a lumber camp, carved (plywood) poles. Cast: lumberjacks with
  axes, a Mountie on a fake horse, hockey players (slapshot pucks), a moose; everyone apologizes as they attack
  ("SORRY! SORRY!").

## The sub-boss: CULTURES OF THE WORLD (the theater at the end of the streets)

A stage show in a proscenium theater: the curtain, the stage, and a foreground crowd in silhouette watching the WHOLE
time (they cheer, boo, film it on their phones). The PA narrator (a smarmy patriotic announcer) introduces each
culture and spins it: "SPAIN HAS BULLFIGHTING. NEAT. BUT NOT AS COOL AS EATING HOT DOGS." / "...NOT AS COOL AS A
MONSTER TRUCK." / "...A FOUR-DOLLAR HAMBURGER." / "...FIREWORKS YOU BOUGHT ACROSS STATE LINES." etc.

Eight showpieces, each a pair or troupe of animatronics to kill (none of them a showcase country):
1. **SPAIN:** a bullfight: an animatronic bull (charges) and a matador (cape, sword thrusts). (the user's)
2. **IRELAND:** a Riverdance line (step dancers kicking in perfect unison) and a leprechaun flinging gold coins from his
   pot. (replaces the user's gladiators: Italy is already a pavilion)
3. **EGYPT:** a pharaoh mummy (bandage whips) and a sphinx (laser eyes).
4. **RUSSIA:** a dancing bear on a unicycle and Cossack dancers (kicks).
5. **THE NETHERLANDS:** a windmill (its blades a hazard) and clog-dancing milkmaids (thrown clogs).
6. **AUSTRALIA:** a boxing kangaroo and a croc-wrangler (with the croc).
7. **GREECE:** a minotaur and Spartan hoplites (a shield wall).
8. **BRAZIL:** carnival samba dancers and a giant parrot float.

The cycle (the user's): each showpiece gets a limited time; not dead in time, the curtain drops and rises on the next
LIVING showpiece (damage done stays; dead ones never come back). The show ends when all are dead. Sub-boss rules: both
sides lock once it starts; no i-frames; big total HP; the PA reacts to each kill ("SPAIN: CANCELLED.").

## The helicopter: HELICOPTER RIDES ACROSS THE WORLD

- **Boarding:** he skips the line and climbs in. The pilot, HELICOPTER HARRY (late 40s, gray ponytail, tie-dye under a
  flight jacket, round tinted glasses, a peace sign on his helmet), is relentlessly nice and preachy: tolerance, "every
  culture is beautiful", reusable straws, "we're all one big human family". He shows the landmarks: replicas MUCH
  bigger than the real ones ("IN AMERICA, EVERYTHING IS BIGGER. EVEN OTHER PLACES."). Meathead gets fed up: "SHUT UP,
  HIPPIE." He throws Harry out and jacks the helicopter.
- **Harry turns:** the facade drops: bigoted and swearing constantly (lots of swearing; NO slurs: "DAMN FOREIGNERS",
  "I WAS FAKING IT THE WHOLE TIME, YOU SON OF A BITCH", "THEY SHOULD BUILD A WALL AROUND THE WALL"). On a jetpack, he
  commands the landmarks to turn on him.
- **The shooter** (space/orbit's way: free 4-way flight, auto-scroll, kept on screen), in a Cuphead-Djimmi framing: you
  seem to be going around a giant circle (a globe), the upcoming landmarks standing on it ahead, coming round as each is
  beaten. The helicopter ALWAYS faces right. Controls (the user's): **X** a machine gun; **Y** up to three homing
  rockets, on a cooldown; **B (charge)** tilts the rotor that way and BOOSTS, shredding human enemies (the jetpackers)
  it hits: plain or right+B forward; left+B bends back and boosts backward slicing anything to the left; down+B flips
  upside down and blends anything below (rightside up after); up+B boosts up slicing above.
- **The gauntlet (mini-bosses, one at a time):** the souvenir launcher's landmarks (src/m2/weapons/souvenir.ts, in order
  of weight) as giant googly-eyed mechs, each with its own bullet-hell patterns, jetpack goons in between: the Eiffel
  Tower, the Sydney Opera House, Christ the Redeemer, the Leaning Tower of Pisa, the Taj Mahal, Big Ben, the Colosseum,
  the Great Pyramid, an Easter Island head (moai).
- **The end:** Harry, furious, blasts him out of the sky with a rocket launcher; the crash; then the HELICOPTER HARRY
  fight on the ground (mechanics: the user's, later). Harry is the land boss: full detail from the first pass, every
  line group in clean / shitty / naked pools.

## Standing rules

All of Hollywood's (hollywood-spec.md "Standing rules"): prototype first pass (crude readable art, FULL game feel; the
land boss fully drawn), fill in the unspecified, all-new enemy kinds, women and men of every skin tone in the cast
(seeded variants), sub-bosses must die, boss lines by player state, dialogue voice (blunt, short, vulgar, specific; no
repeats within 45 s via pickLine; no talk-over; speech text only while spoken; subtitles whole on screen), new hurt
sources get hurt + death lines, hazards hurt enemies (not enemy gunfire), revisits differ, checkpoints restore world
state, fake-3D rules, standable reads standable, impassable reads impassable, signs readable / held up / themed,
American spelling, lean drops (6% / 5% small), a big health + ammo refill before every boss door, time of day by lands
cleared, HUD hidden in cutscenes, HUD clear zone, held weapon in front, M2 weapons vs bosses (no instakills on bosses),
voices recorded (npm run voices) and the M2 html rebuilt (npm run release:m2) after each job.

## Decisions (job 1)

- **One walk, no seams.** The ten pavilions and the theater sit back to back (geometry.ts SECTIONS, FLX = 600000), all
  on the promenade at GY at their ends; the camera runs the whole streets (index.ts limitsOf), with no section walls or
  doors between them. Only theater -> helipad -> Harry's arena are cuts (endExits/runExits, crude for now). Mexico's
  left end is the streets' only wall.
- **Budget.** Streets ~39000 px of play (pavilions 3600-4200 wide, China 5200 counted by its climb) + the theater
  sub-boss: about half the land. The helicopter half (boarding, the shooter ~7 min auto-scrolled, Harry) is the other.
  Total about Hollywood's.
- **Checkpoints** by tens per section: Mexico 0-9, Norway 10-19, China 20-29, Germany 30-39, Italy 40-49, Japan 50,
  Morocco 60, France 70, UK 80, Canada 90, theater 100, helipad 110, Harry 120 (named; the cheat lists them all).
- **Shared street systems** (one lot for the whole walk, so nothing resets crossing a border): state.ts (the PA queue;
  barks rare, never over each other or the PA; Meathead's gags once each, never over the PA), shots.ts (everything
  thrown or blown, each its own hurt source), backdrop.ts (one sky + lagoon + fireworks barge, each pavilion's far
  landmark by parallax), pavilion.ts (each pavilion's PA hello -> his arrival line -> his gags by x and height),
  cast.ts (one fighting AI under every cast kind; Spooky's costume drawer under them: seeded men and women of every
  skin, build and hair, the name tag always on), water.ts (pools and canals he swims in; walkers keep out), movers.ts
  (moving one-way platforms that carry whoever's on them).
- **Draw order** in every pavilion: the promenade first, then the set-back fronts (FACADE_D) standing on it, then the
  play-plane boxes (box3: back faces before fronts), standable things with the lit lip, signs last.
- **Mexico:** the land's gate (FOREIGN LANDS, flags), the taco cart (TACOS: AN ITALIAN TRADITION), the stepped pyramid
  climbed over with the dusk-lit mercado plaza inside under its terraces, the cantina balcony. Cast: mariachi (trumpet
  blast rings), sombrero thrower (the hats land and ROLL along the ground), blindfolded pinata host (hits anybody, the
  cast too), luchador (the grappler: a lunge, a suplex).
- **Norway:** the troll bridge (two trolls hold up a plank), the lutefisk booth, THE FJORD (a wave pool 800 wide): the
  longship ferries across and back on the swell; the wave machine sends a wave down the pool every ~5.5 s that hurts
  whoever's in the water (him: `m2:fl_wave`; the cast: WAVED!). The stave church climbed roof by roof. Cast: viking
  (axes; the horns are spiky: a dive kick onto them is punished), shield viking (shielded front, slow to turn, a bash),
  the lutefisk lady (fish-jelly lobs that gag him; the tray up close).
- **China:** the Great Wall is the ground itself (runs; slopes drawn as stairs), so the cast walk it too: the gate
  tower climbed inside (its door at the bottom), the rampart, watchtower 1 walked through (on its roof an intern and an
  ammo), a steep dip, watchtower 2 climbed inside (its far wall shut), the dragon dance's flat, the summit pagoda's
  roofs, and down the wall's raw end by the repair scaffold (zigzag planks 140 apart: climbable back up). Cast: kung fu
  kids (a crouch, then a flying kick, shouting the wrong move), the pyrotechnics intern (rockets up and over; the bursts
  hurt the cast too), THE DRAGON (six kids under one cloth, `m2:fl_dragon` segments: the first alive leads, dancing and
  leaping at him; the rest follow its trail; kill a segment and that kid's knocked out of the cloth).
- **Germany:** the biergarten (tables, the bandstand and its roof), the pretzel and sausage stands, then the castle: the
  portcullis is shut (ground to battlements: impassable reads impassable), so the way on is the giant cuckoo clock's
  wheel of six carved figures turning a sixth at a time (ride them up; kegs to reach the lowest); over the battlements
  under the cuckoo's door (every 6 s it bursts out and pecks: `m2:fl_cuckoo`, it hits the cast too; the door's click
  first is the tell). The far tower's balconies down (and back up: revisits). Cast: tuba (a fat slow ring that shoves
  hard), barmaids and barmen (stein lobs), the lederhosen slap-dancer (a slap flurry).
- **Italy:** the piazza and its pizza oven; the Grand Canal (its bridge CLOSED FOR REPAIRS: two stubs that don't meet)
  with a gondola ferrying; the palace's stacked balconies; a second canal with two gondolas in step (ride one, hop to the
  other); the Leaning Tower of Pizza, each floor further out. Cast: gondolier (a long level pole swing; keeps to his
  boat: no pathing, exempt from the canals' keep-out), pizzaiolo (spinning pies), the opera singer (the high note: a slow
  ring through anything that rings his ears), nonna (always a woman; the spoon close, flung far).
- **Signs** in each pavilion's lettering (kit.ts LOOKS), with the park's mistakes: EUROPE'S MEXICO, NORWAY: CAPITAL OF
  SWEDEN, CHINA: A TASTE OF ASIA (JAPAN), THE GREAT WALL: BUILT TO KEEP OUT THE MONGOOSE, CUCKOO CLOCK: SWISS MADE,
  AUF WIEDERSEHEN (GOODBYE IN DUTCH), ITALY: BIRTHPLACE OF THE TACO, THE LEANING TOWER OF PIZZA.
- **Drops:** a couple of placed small pickups per pavilion, up the climbs (lean); the big health + ammo refill at the
  theater doors (before the sub-boss) and at the crash site (before Harry).
- **Stubs** so the land runs end to end: Japan..Canada (stubPavilion: fronts, the sign, a COMING SOON board), the
  theater (its front, the refill, its doors), the helipad, Harry's arena with a clearly temporary walk-past VICTORY ->
  walk-away -> hub (land cleared). The hub portal is open; the walk in is walkAway/intoForeign.ts; Harry's walk-away
  (walkAway/helicopterHarry.ts) a placeholder.
