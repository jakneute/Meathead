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

**The user (2026-10-16): "there's essentially two sequences: pavilions, helicopter. less than a typical level but
lengthier individually."** The land is just TWO sequences (fewer than other lands have), each one long. The helicopter
sequence is a substantial stretch (the tour, nine mechs with goon waves between, the end), roughly matching the
pavilions sequence (which gets lengthened in its own job).

Two stretches, about half the play time each; the whole land about as long to play as Adventure / Hollywood Land.
FEW hard transitions (the user's): each stretch flows continuously, as one walk and one flight, with as few cuts,
fades and section doors as possible (sections exist in code, but the player shouldn't feel the seams).

1. **The streets** (the World Showcase walk, ~half): ten pavilions in Epcot's order, flowing one into the next along
   the lagoon promenade, then straight on to the helipad (the Cultures of the World theater sub-boss was AXED: the
   user, 2026-10-16). Platforming only (NO new traversal
   mechanic in this land: the user's call), but plenty of verticality in every pavilion, most of all in China (the
   Great Wall climb: watchtowers, steep stepped ramparts up and down a mountain ridge, a gate tower climbed inside).
2. **The helicopter** (~half; the helicopter gauntlet is now the land's mini-boss rush): boarding and the pilot's tolerance tour, the jacking, then the shooter (the landmark-mech
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

## The sub-boss: CULTURES OF THE WORLD (the theater at the end of the streets) -- AXED (user, 2026-10-16)

**AXED (the user, 2026-10-16):** the theater sub-boss is gone entirely (its folder, section, checkpoints 100-102,
voices). The streets go through all ten pavilions and at the end of Canada (the trail's stairs down, the ranger
station) he walks straight on, no cut, to HELICOPTER RIDES ACROSS THE WORLD's helipad (the heli section sits where the
theater was, on the end of the streets' walk: FLX+57800 since job 4b). The big health + ammo refill and checkpoint 110 are at the
helipad, before the ride. The helicopter gauntlet is the land's mini-boss rush. What follows (and job 3's decisions)
is kept only for the record.

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
- **THE LEANING TOWER OF PISA (the user's, 2026-10-16):** about midway through the rush. A joke fight: it's IMPERVIOUS
  to all damage (shots ping off, a big IMMUNE read) and taunts him about it the whole time, trash-talking how
  unbeatable it is. Yet all it ever does is lean over and fall (a long, telegraphed lean: its shadow/arc where it'll
  land shown, creaking). If the falling tower hits him, he DIES (an instant kill, its own death + lines). If he
  evades it, it smashes down and its health bar goes from 100 to zero instantly, and on to the next monument.
- **The end:** Harry, furious, blasts him out of the sky with a rocket launcher; the crash; then the HELICOPTER HARRY
  fight on the ground (below). Harry is the land boss: full detail from the first pass, every line group in clean /
  shitty / naked pools.

## The land boss: HELICOPTER HARRY (the user's fight design, verbatim, 2026-10-16)

> got helicopter harry spec'd out. when he blows you out of the sky, you land in a fiery landing spot where all the
> monuments you blew up are in shot. he rips off his uniform to look like a jacked Rambo type, bandana and all. meathead
> is impressed, but his pivot from annoying hippie to vulgar xenophobe goes so far that even meathead is taken aback. "i
> liked you better when you were a pussy hippie, and that version of you really sucked." harry summons a companion for
> the fight. it cannot be harmed but it assists him: the statue of liberty - "a real American monument"
>
> harry has a machine gun and blasts it head on and while walking slowly. he will occasionally jump in the crown of the
> statue (you only see the head and upper portions of the statue) and commands it to smash you. the status does a long
> heavily telegraphed windup with its fist and smashes the ground and gets stuck, parodying many boss fights where you
> fight a giant statue that slowly telegraphs its attack and just holds its arm down, like the sentinel fight in the
> most recent wolverine game.
>
> this pisses off harry "you're useless now" eventually the statue does get unstuck and standing again. when it does
> that, harry once again jumps in the crown and the same slow attack happens, increasingly pissing off harry because the
> statue is really "dumb at fighting things much smaller than you"
>
> some moves during the fight is that harry will cling to a wall like in contra and fire his machine gun. there's two
> different arcs. one of them directly to the opposite wall from his elevated position and slowly rotating downwards.
> you need to stand completely underneath him to avoid it. the other wall move he can do is he fires it starting
> straight downwards and arcs it upwards. the most reliable way to dodge it is to uppercut at the last moments on the
> far end of the arena before it arcs up to you.
>
> his weakness is the plague crossbow. does minimal damage to him the darts themselves, but it makes him sick. he forgot
> to take his "airsick pills" and he barfs on the statue - the statue immediately goes to a standing status if not
> already in one and proceeds to barf its own 'concrete guts' onto harry, doing heavy damage. this will make harry jump
> into the mecha statue and follow up with an arm smash attack. these get progressively faster as the fight goes on.
> this also makes sure you cannot 'spam sick' him.
>
> when he dies the statue is saddened his master is dead, and the statue of liberty brings out a statue gun and blows
> its statue brains out. it commits statue suicide. no gore, just statue concrete.

Notes for the builder:
- **The arena:** the crash site, on fire, the wrecked monument mechs from the gauntlet all in shot behind; walls at both
  ends that Harry clings to (Contra style). The STATUE OF LIBERTY stands at the back: only her head and upper body in
  frame (huge), invulnerable; her arm's smash lands on the arena floor and stays down a while (stuck: the parody of the
  giant-statue boss that holds its arm down; its stuck arm likely something to stand on or a wall, the builder's call).
- **Harry's moves:** walking slowly firing his machine gun head on; jumping up into her crown to command the slow,
  heavily telegraphed fist smash (stuck after; his rants: "YOU'RE USELESS NOW", "SHE'S DUMB AT FIGHTING THINGS MUCH
  SMALLER THAN HER"); unstuck, she stands, he's back in the crown, the same again, him angrier each time; the two wall
  sweeps (from up a wall: across to the far wall then sweeping slowly down, safe right under him; or straight down then
  arcing up, best dodged by an uppercut at the last moment at the far end).
- **The weakness (opted in, overriding the "crossbow no vomit on bosses" rule):** the plague crossbow's darts barely
  hurt, but make him sick (no airsick pills): he barfs on her; she snaps standing (if not already) and barfs her
  concrete guts onto him (HEAVY damage); then he's back in her crown for an arm smash that gets faster through the
  fight. That built-in follow-up is what stops him being spammed sick.
- **His death (the user's, 2026-10-16):** TWO deaths, like every boss: the WEAKNESS death (a kill by the plague
  crossbow's effect: buried/drowned in her concrete barf, undignified) and the NON-WEAKNESS death (any other kill;
  nothing special per weapon). AFTER either, ALWAYS the same beat: she's heartbroken, pulls out a statue-sized gun and
  shoots herself in the head: concrete, no gore.
- Boss rules: 666 HP, 60-frame breather, non-weakness 35%; lines in clean / shitty / naked pools for every group;
  Meathead's lines ("I LIKED YOU BETTER WHEN YOU WERE A PUSSY HIPPIE, AND THAT VERSION OF YOU REALLY SUCKED."); the
  rip-off-the-uniform reveal; every new hurt source gets hurt + death lines; Harry fully drawn.

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

## Decisions (job 2)

- **Same shape as job 1.** Japan..Canada keep their 3600-px stretches (FLX+21000..39000, no geometry changes): each its
  own folder (index.ts, kinds.ts, lines.ts), the promenade drawn first, set-back fronts dimmed, play-plane boxes with lit
  lips, signs last. Checkpoints 50-53, 60-63, 70-73, 80-83, 90-93. Two small pickups each, up the climbs. Every climb has
  a way back down and up (revisits); every dead end got a crate or stump out.
- **Shared appends:** shots.ts got shuriken, ki, spit, smoke, plate, pint, tea, puck (each its own hurt source); kit.ts
  LOOKS got japan (black brush on paper, a red drop), morocco (gold on tile blue), france (gold serifs, bistro green),
  uk (enamel white on red), canada (routed plank). The stub (stub.ts) is no longer used by any pavilion.
- **Japan:** two torii (both beams standable), the koi pond (stepping stones; the park's ROBOT KOI leaps out on a
  schedule, bubbles first: `m2:fl_koi`, it hits the cast too), the vending-machine alley (one stacked), the FIVE-STORY
  PAGODA climbed inside floor by floor (doors at the bottom), out through its top roof and down its eaves outside (both
  sides). The sumo ring on its clay mound, stone lanterns, the manga stand. Cast: ninja (shuriken; every few seconds a
  smoke-bomb blink round BEHIND him onto whatever he's stood on), sumo (shove close; the leg-up STOMP out to ~270 knocks
  about whoever's stood near, him and the cast: `m2:fl_sumo_stomp`), samurai (KindDef.pointy: the katana always out
  front; a dash and cut), cosplay kid (screams a legally distinct half-remembered move name through a long tell, then the
  glitter energy ball).
- **Morocco:** the gate, the ROOFTOPS (flat roofs stepping up, carpets hung on lines across the alleys: just ledges), a
  gift-shop tower (ELEVATOR OUT OF ORDER: kept clear of anything religious) climbed inside to its balcony and dome, down
  by the carpets hung off its far side; THE TANNERY: five dye vats (in one he's scalded and popped out: `m2:fl_dye`; the
  cast too, knocked in; walkers keep out), drying racks over them the high way; the hookah lounge's tent, the spice
  stall. Cast: carpet salesman (a rolled-rug ram), snake charmer (the snake strikes low and long out of the basket:
  `m2:fl_snake`), the camel suit (spit lobs: a gag stun), the hookah bro (slow drifting smoke clouds: cough stun).
- **France:** cafes (striped awnings standable, tables), the newspaper column, THE CABARET (the can-can line kicks in
  UNISON on a fixed beat, near him or not; the marquee over the stage is the high way), the EIFFEL-ISH TOWER (girders
  up the left leg, the first deck over the arch, level two, the top; an ELEVATOR rides the right leg between the ground
  and level two, dinging), the bakery street, the Mona Lisa print. Cast: mime (an INVISIBLE WALL: a solid block that
  eats his projectiles, 6 to break, gone in 7 s or when the mime dies; drawn as a faint shimmer that cracks; close, a real
  punch), waiter (plates), baguette swinger, can-can dancer (men and women), the rude smoker (smoke).
- **The UK:** fog (thin drifting banks; never hides anybody), the palace gate's sentry boxes, the DOUBLE-DECKER BUS on its
  route (it stops at each end and REVERSES back, beeping; its front runs over whoever's in the lane: `m2:fl_bus`, the cast
  too; its roof a mover: a hooligan rides it), phone booths, the pub climbed over, TOWER BRIDGE over the Thames (a pool):
  its halves lift on a schedule after a bell (whoever's on them goes in the river), the towers' stairs to the high
  walkway (the dry way). The tea shop's cart. Cast: royal guard (harmless and frozen at attention till hurt by anything,
  then awake for good: fast, the bayonet hits hard), hooligan (pints; no pathing: keeps to the bus top or the pub roof),
  tea lady (always a woman: scalding tea lobbed, the pot close), bobby (truncheon, whistle).
- **Canada:** the lumber camp (log piles, carved PLYWOOD poles: MADE IN OHIO, stumps between), the log pond (three
  floating logs drifting and bobbing: movers), THE FALLS: rock ledges zigzag up across the waterfall (a pumped pipe) to
  the clifftop (900 up); the MAPLE LOG FLUME on the clifftop dumps a log down the falls every 3.5 s (it slides along the
  trough first: the tell; `m2:fl_flume_log`, the cast too). The rink on top (low boards: the pucks ricochet off them),
  then the trail's stairs down (15 of them: "1,000 STAIRS"), the ranger station, the theater. Cast: lumberjack (an
  overhead chop), Mountie on a stick horse (a gallop lunge), hockey player (slapshot pucks: fast, ricochet twice), moose
  suit (KindDef.spiky antlers: `m2:fl_moose_antlers`; a head-down charge). Every Canada strike shouts SORRY (a shared
  pool in all eight voices).
- **Signs (the park's mistakes):** JAPAN: A TASTE OF ASIA (CHINA), MANGA (READ BACKWARDS), SAYONARA (THANK YOU);
  MOROCCO: THE MIDDLE EAST (IN AFRICA), THE SOUK (SOUP), SHUKRAN (CHEERS); FRANCE: OOH LA LA ZONE, BISTRO: FRENCH FRIES
  (BELGIAN), EIFFEL TOWER ACTUAL SIZE* *BIGGER, AU REVOIR (HELLO); UNITED KINGDOM: ENGLAND / BRITAIN / LONDON (SAME
  PLACE), THE QUEEN'S HEAD (AND SHOULDERS), TOWER BRIDGE (LONDON BRIDGE) (SAME BRIDGE), CHEERIO (HELLO); CANADA:
  AMERICA'S HAT, CARVED POLES (PLYWOOD) MADE IN OHIO, MAPLE LOG FLUME CLOSED (THE LOGS GOT OUT), THE TRAIL 1,000 STAIRS (15).
- **Voices:** 37 new cast voice ids in cast.json (m2.foreign.ninja .. moosef; the tea lady one voice); the PA's hello,
  his arrival and gags, barks in clean / shitty / naked pools, hurt + death lines for every kind and every new source.

## Decisions (job 3) -- AXED with the theater (kept for the record)

- **One walk in, no cut** (theater/layout.ts): the theater's front set back off the promenade (columns, the marquee:
  NOW SHOWING: EVERYBODY ELSE), its street doors through the side wall (the wall's outside face over the lobby fades as
  he goes through), THE LOBBY (ticket booth FREE* *$189 PARK ADMISSION, CONCESSIONS: AMERICAN ONLY / FREEDOM FRIES, the
  posters, chandeliers; the big health + ammo by the house doors, checkpoint 101), THE HOUSE (the side aisle, three
  steps up), THE STAGE (one screen, 800 wide, 60 up), the stage-right wing door, three steps down BACKSTAGE (fly ropes,
  sandbags) to the EXIT (HELICOPTER RIDES ACROSS THE WORLD: endExits' right end to DOORS.heli.start; back from the
  helipad lands backstage, checkpoint 102). In the house and on the stage his feet sit higher on screen (row 400) so
  the seats show under the stage.
- **The crowd** (art.ts): two rows of heads and shoulders in silhouette in the foreground, nearer than him (they slide
  past faster than the world), rim-lit by the stage, the whole time. Moods: idle bob, cheer (arms up, at kills and
  cancels), laugh (him hurt), boo (thumbs down, a showpiece timing out), ovation (on their feet, clapping, the call).
  Phones up with lit screens (more for a kill; nearly all of them when he's naked; the odd flash). Applause under it.
- **The narrator** is the show's own PA (new voice m2.foreign.showpa, announcer fx), not the streets' PA. Each culture:
  its INTRO (2 each; a RETURN pair when it comes round again), then the SPIN from a shared pool of 20 ("NEAT. BUT NOT
  AS COOL AS ..." hot dogs, monster trucks, a four-dollar hamburger, fireworks bought across state lines, a bald eagle,
  truck nuts, free refills, the moon...), two recorded lines back to back (no line twice in 45 s: pickLine). CANCEL per
  culture ("SPAIN: CANCELLED."). About HIM, clean / shitty / naked pools: the volunteer, him hurt, the timeouts,
  halfway, the wrap. The whole house chants (new voice m2.foreign.crowd, chorus fx: USA! USA!, BOO!, OLAY! when he
  jumps the bull, ENCORE!); one guest at a time shouts (the park guests' voices; about him by his pants, at kills, at
  him getting hit). Meathead sparse: the lobby, the house, "I'M NOT A VOLUNTEER. I'M CUTTING THROUGH.", a line at most
  showpieces' first curtain, now and then at a cancel or a timeout, the call. Lobby and house lines once a land visit.
- **The start:** a few steps onto the stage, the house takes him for a VOLUNTEER: the stage-left wing slams shut (the
  stage-right wing door is shut till it's over: CAST ONLY), the spotlight, the narrator, his reply, the opening (a
  cutscene beat: HUD hidden, SKIP >> for all of it), then the curtain goes up on SPAIN (always first).
- **The cycle:** 25 seconds on the STAGE CLOCK (a seven-segment LED countdown hung off the proscenium's arch; it beeps
  the last five, blinks at zero). Dead in time: CANCELLED, cheers, the curtain comes down. Out of time: an alarm, boos,
  the curtain down anyway. Down, the turntable turns (a rumble), the set changes, up on the NEXT LIVING showpiece in
  order (wrapping round). Damage stays; the dead stay where they fell, as wrecks on their set, when their showpiece
  comes round again. All eight dead: the CURTAIN CALL (a cutscene beat: down, a bare stage, up on him alone in the
  spotlight, confetti, the house on its feet, the wrap, his line, the exit line), then both wings open.
- **The animatronics** (troupe.ts, robots.ts): each troupe distinct, crude but readable, clearly machines (plastic
  faces, LED eyes that glow on a tell, panel seams, servos at the joints, chipped paint, poses that tick over every 4
  frames with the odd twitch), sparks when hit, and they BLEED red hydraulic fluid (not `robot` kinds, on purpose: the
  kept joke), seizing over dead in a spreading red pool. Every attack has a tell; every attack is its own hurt source
  with hurt + death lines (17: m2:fl_th_bull .. m2:fl_th_parrot). Their hazards hurt each other (damage numbers pop):
  - SPAIN: the BULL (walks at him, paws and snorts steam, CHARGES the width of the stage; into the wall it's stunned,
    sparking; it gores the matador too; jump it and the house goes OLAY), the MATADOR (cape flourish, sword up with a
    glint, a lunging thrust).
  - IRELAND: the STEP-DANCE LINE (four in a row moving as one, arms dead at their sides; a stomp-stomp, then all four
    high-kick at once), the LEPRECHAUN (on his pot of gold in a corner, flinging three gold coins in arcs; get close and
    he hops to the far corner, pot and all; stray coins clock the dancers).
  - EGYPT: the PHARAOH MUMMY (shambles; arm back, then the bandage LASH out to 190 that yanks him in), the SPHINX (lying
    at the side; eyes glow, then a laser from its eyes down to the floor sweeping out across the stage: jump it; it
    burns the mummy too).
  - RUSSIA: the BEAR ON A UNICYCLE (round and round the stage at him, no brakes, bouncing off the walls; runs over the
    Cossacks too), two COSSACK DANCERS (squat-kick hopping in, arms crossed; rise, then a flying split kick).
  - THE NETHERLANDS: the WINDMILL (center stage; its four sails sweep the floor in front of it, faster as it's hurt:
    time the gap to get past; they swat the milkmaids too), two CLOG-DANCING MILKMAIDS (keeping their distance, lobbing
    clogs at where he's going).
  - AUSTRALIA: the BOXING KANGAROO (hops in; a one-two jab, every third time it leans back on its tail for the
    two-footed kick), the CROC and its WRANGLER (the croc creeps, turns slowly, jaws wide then SNAPS, biting the kangaroo
    or the wrangler if they're in front; the wrangler holds its tail and throws a BOOMERANG over it now and then, out and
    back; with the croc dead he throws more often).
  - GREECE: the MINOTAUR (paws and charges from far; up close the double axe up high, then CHOPS; tramples the
    Spartans), three SPARTAN HOPLITES (a shield wall moving as one, slow to turn: shields block shots from the front,
    spears out front punish a charge (KindDef.pointy: m2:fl_th_spear); now and then spears drawn back, then thrust).
  - BRAZIL: three SAMBA DANCERS (feather backpieces; shimmy in, arms up, a feathered SPIN), the GIANT PARROT FLOAT (rolls
    up and down the stage, stopping to turn at each end; its fringed skirt runs over him and the samba line; the parrot
    rears back and PECKS the floor in front).
- **Numbers:** about 9000 HP across the eight (troupe.ts `HP` scales it all): Spain 1000, Ireland 860, Egypt 1160,
  Russia 1000, the Netherlands 1220, Australia 1140, Greece 1210, Brazil 1440. To the engine they're mid-boss hitboxes
  (show.ts: BIG health, what comes off each frame is the hit, so every hit lands, no breather; mid-boss weapon hits, no
  instant kills or status effects; grab 'none'); anything that would take one out of the world is a heavy hit (150).
  Lean drops: a dying animatronic drops a small health 6% / small ammo 5%.
- **Sub-boss rules:** both wings locked from the volunteer to the call; dying mid-show it's all eight again from the
  lobby; SHOW_MEMO once it's over (and any start at checkpoint 102 on). Revisits: the marquee reads SHOW CANCELLED /
  ALL OF IT, the house doors' sign SHOW OVER, the seats empty (popcorn tubs left), the stage struck (the wrecks shoved in
  a pile upstage in their fluid), the wing door open (EXIT THIS WAY).

## Decisions (job 4)

- **The theater's axed** (the user): heli sits where it was (FLX+39000..42000) as a STREET section, so Canada's trail
  walks straight onto the helipad (no cut). Checkpoint 110 and the big health + ammo at the pad, before the ride.
- **Files** (heli/): geo.ts (the pad's layout, the fixed flight camera CAMX/CY high over the pad, the globe), state.ts,
  lines.ts, talk.ts (one voice at a time), copter.ts (the helicopter drawn and flown, the gun, rockets, boost),
  mechs.ts (the nine: bodies, moves, shots, beams, drops, minions, the Pisa joke), mechArt.ts, globe.ts, goons.ts,
  harryArt.ts (HELICOPTER HARRY fully drawn: job 5 should import drawHarry for the arena), index.ts (the flow).
- **The helipad:** the queue (22 guests behind switchback rails, WAIT TIME: 3 HOURS, TOLERANCE: MANDATORY) yells at him
  as he walks the length of it (guest voices, by his pants); Harry waves by the helicopter. Past the queue it's the
  BOARDING cutscene (HUD hidden; SKIP >> skips everything up to his taking the controls): he walks to it, hops in the
  back, Harry's welcome by his pants (no judgment), up off the pad, the camera going up with it, the globe rising in
  from under. No hard cut anywhere: the tour turns into the shooter in place.
- **The tour:** the helicopter held on the left of the screen; the globe turns the replicas round (plain, on plinths:
  no legs, no eyes yet); Harry's five lines with Meathead's grunts between, then "SHUT UP, HIPPIE."; Harry shoved out
  his door (still nice: "THAT IS NOT A SAFE SPACE!"), Meathead slides into the pilot's seat ("MY HELICOPTER NOW."),
  Harry roars back up on the ride's emergency jetpack, red-faced: "I WAS FAKING IT THE WHOLE TIME, YOU SON OF A
  BITCH!", the rant, "LANDMARKS OF THE WORLD! WAKE YOUR ASSES UP AND KILL THIS PRICK!", and every landmark grows legs
  and googly eyes. The controls card (X MACHINE GUN, Y ROCKETS, direction + B BOOST: real button icons, store.ts
  heliTips) shows ~12 s, once a run.
- **The flight:** one fixed screen (the camera doesn't scroll: Cuphead's Djimmi, the world goes by instead): the sky
  by the hour with clouds and speed streaks streaming left, the GLOBE across the bottom turning the whole time, the
  landmark he's fighting standing on it on the right, upright on its stomping mech legs; the next ones further round
  ahead, smaller (further off), and the beaten ones rolled away behind as wrecks (blackened, on their sides, smoking,
  eyes X'd; the Leaning Tower lies flat with its legs still standing). The helicopter always faces right; his feet kept
  on screen (x 150-770, y 120-560); the hurtbox is his own seated box (the boom and the rotor never count).
- **The controls:** X the chin machine gun (a round every 4 frames, the engine's machine-gun rounds: 22 to people, 10
  to a landmark); Y homing rockets (three charges, one back every 2.5 s; they go for the nearest lackey or minion,
  else the landmark; a blast of 64: 140 to people, 120 to minions, 70 to a landmark; the charges drawn bottom left);
  B the boost (16 frames at 15 px a frame, a 14-frame cooldown: its own, never his power cells; one every 30 frames,
  twice as often as a charge on foot; a BOOST meter by the rockets): plain/right forward nose-down, left bent back, up
  straight up, down flipped upside down (the rotor underneath) and back over after; its blades reach 70 px past the
  helicopter the way it's going and SHRED any lackey or minion (gore, SHREDDED!); into a landmark it's a 60 hit and he's
  bounced off (no hurt for it).
- **The nine** (hp: Eiffel 3600, Opera 4000, Redeemer 4400, Taj 4800, Big Ben 5000, Colosseum 5400, Pyramid 5800,
  Moai 6600; mechs.ts HP / HP_SCALE): not engine enemies (their health is their own; rounds that reach one are spent on
  it; no i-frames; mini-boss rules). Each: Harry orders it in (by his pants), its intro, ~1.7 s before it fires, then
  four moves in random order (never the same twice running), shorter gaps under half health, taunts into quiet, a hurt
  line at half, its death line, a chain of blasts and over; Harry's reaction; Meathead now and then.
  - EIFFEL: rivet fans off the tip, a rivet spiral off the second deck, the SEARCHLIGHT (a tracking laser), keychain
    Eiffels homing in. OPERA HOUSE: music notes in waves, the shells clap shut (rings), the HIGH C (big slow notes that
    burst), SEAGULLS diving. CHRIST THE REDEEMER: arms spinning (a spiral off its hands), THE HUG (both arms swing in
    to its reach, top and bottom: get further off than that), the halo (a ring with a gap at him), aimed bursts.
    TAJ MAHAL: a double marble spiral off the dome, its MINARETS thrown up and dropped on his column (red warning
    columns), ripples off its pool, aimed marbles. BIG BEN: its HANDS (the long minute hand and the short hour hand
    sweeping opposite ways out of the face: stay out of reach), BONG rings, bouncing gears, teacups. COLOSSEUM: walls
    of shots out of its arches with one row open, LIONS leaping at him, THUMBS DOWN (a giant fist dropped on him), a
    fan. PYRAMID: the capstone EYE (a beam that follows him), two-ton blocks lobbed, a sand spiral, scarabs. EASTER
    ISLAND HEAD: the STARE (beams out of its eyes), a spat boulder that bursts, little heads bouncing, rocks rained
    down; at half health THE BODY (it rises up out of the globe: "NOBODY KNOWS ABOUT THE BODY").
  - THE LEANING TOWER OF PISA (the user's): impervious (every hit pings: IMMUNE pops, the bar reads IMMUNE), taunting
    all the while (~7 s), then the LEAN (~5.3 s: creaking, wobbling, its whole sweep shaded red and where it'll lie
    outlined), then the FALL to the left from its base: on him is death (`m2:fl_pisa_fall`: its own death screen and
    lines; "TOLD YOU! ...CAN SOMEBODY HELP ME UP?"); dodged (far up-left beyond its length, or right of it) it smashes
    down, its bar goes from full to nothing, "...I MEANT TO DO THAT.", "IT KILLED ITSELF.", on to the next.
- **Their shots** are engine enemy projectiles (`m2:fl_mech_<id>_shot`: the engine does the hurt and knockback), drawn
  here over the engine's own (rivets, notes, marbles, gears, teacups, blocks, rocks, orbs). Beams, drops, minions and
  contact are this section's own hurts. Every one has hurt + death lines (28 sources in lines.ts HURT).
- **The lackeys** (`m2:fl_jetgoon`): the ride's cast members in blue polos, aviator caps and goggles on the ride's
  emergency jetpacks (Spooky's costume drawer: men and women of every look by seed, name tags on). Hoverers (in to a
  spot, flare shots), divers (line up, then straight at him), sneaks (from behind him, above or below: teaching the
  back, up and down boosts). Two or three waves before each landmark (goons.ts WAVES), the first a slow lesson; the
  globe turns the next landmark round meanwhile (~5 s). Barks by his pants (two voices).
- **Checkpoints:** 111-119, one per landmark, set as it comes on; starting again there: up in the air, the globe round
  to it, the wrecks before it in place, straight into it (no waves). A big health + ammo floats out before the Easter
  Island head. Lean drops from the lackeys (the engine's); what's dropped up here floats.
- **Harry** (fully drawn: gray ponytail, white helmet with a peace sign, amber round glasses, gray goatee, tie-dye under
  an olive flight jacket, jeans, socks and sandals; red-faced and snarling once turned, the emergency jetpack, a rocket
  launcher for the end) hovers over the top middle the whole gauntlet: orders each landmark in, reacts to each wreck,
  heckles into quiet, gloats when he's hit, curses the lackeys' deaths; clean / shitty / naked pools; swearing,
  regressive, NO slurs.
- **The end** (a cutscene, skippable): every landmark down, the lackeys gone; Harry's rant (by his pants) and the
  launcher up; "OH, COME ON."; the rocket, the hit, the helicopter burning and spinning down off the bottom of the
  screen; the white; Harry's arena at DOORS.harry.start with him on his feet, the camera his, weapon switching back
  (MEMO done: the ride's gone for good; stageMemo `m2:fl_heli_wrecks` = 9 for job 5's crash site). Back on the pad
  later: no helicopter, a scorch, CLOSED (HELICOPTER MISSING), nobody in line.
- **Voices:** new ids in cast.json: m2.foreign.harry, m2.foreign.jetgoon / jetgoonf, m2.foreign.mech_<id> (nine).
- **Length:** the tour ~1 min (skippable), nine fights ~40-60 s each, ~20 s of lackeys before each: ~10 min, about
  the pavilions' length.

## Decisions (job 4b)

The user, with the theater axed: "make the pavillions a bit longer to compensate"; "there's essentially two sequences:
pavillions, helicopter. less than a typical level but lengthier individually."

- **Every pavilion ~50% longer, new content on its far end.** The old stretch of each is untouched (its x's are from
  its own start); the new stretch is its own file in the pavilion's folder, hooked into index.ts (build, update, draw
  back and front, lamps, water), and each old LEAVING sign moved to the new end. Widths: Mexico 6200, Norway 5600,
  China 7600, Germany 5600, Italy 5800, the other five 5400 each: the streets 57800 px (were 39000), ~12 min played.
  Every later section moved on together (geometry.ts SECTIONS; DOORS follow); the helipad's FLX+57800, Harry's arena
  FLX+71000. Still one walk: no doors, fades or walls. Promenade first in every draw (the dug-out and hill stretches
  leave it out under them).
- **Each new stretch:** more climbing (each has a climb or tower; nothing on the way on is skippable at ground where
  it's a wall: impassable drawn down to the ground, and every climb has a way back down and up), the pavilion's cast in
  tougher mixes (shield walls at a gate, a tuba at the top of a ramp to shove him back down, ninjas and a sumo on the
  train's walkway), a set piece on a timer with a clear tell, which hurts the cast too (hazardHit; the cast keep out of
  it while it's live: setHazardZones), its own hurt source with hurt + death lines, Meathead's gags by x and height,
  and a cast bark at the set piece (setpiece.ts `shout`: a cast voice over the prop, one voice at a time, the barks'
  spacing). Two small pickups each (lean).
- **setpiece.ts** (new, shared): hurtIn (a hazard's box on him), hitCastIn (on the cast), playerIn, the prop shout,
  placePickups.
- **Mexico, LA QUEBRADA:** a fiberglass cliff (solid to the ground) climbed by its outcrops, a diving board off its top
  over the DIVE POOL; the cast divers on a pole platform (CAST ONLY) throw their arms up and shout, then plunge onto
  whoever's under them (`m2:fl_cliff_diver`, the splash too); his own dive off the board gets TEN. TEN. TEN.; the
  outcrops on the cliff's far face are the way back up. The tequila stand (APPLE JUICE). Checkpoints 3-4.
- **Norway, THE TROLL TOLL BRIDGE:** two three-story trolls (knee, shoulder, head) hold a bridge up over the troll
  river; the TOLL GATE on it is shut (deck to crossbeam) and the TOLL GANG (two shield vikings, a viking, the lutefisk
  lady) demand five dollars; all dead, the gate goes up (TOLL PAID (IN BLOOD)) and stays up for the land visit (through
  deaths). Or swim under: the TROLL UNDER THE BRIDGE's arm sweeps the river (bubbles first; `m2:fl_troll_hand`).
  Checkpoints 13-14.
- **China, THE SECOND RIDGE:** the wall goes on past the pagoda: down into a saddle (the B-TEAM DRAGON, four kids under
  a cloth for six), up the steepest stairs under the FIREWORKS BATTERY's mortar volleys (red X marks and the hiss
  first, one mark on where he's stood; `m2:fl_mortar`; it stops once its intern's dead), THE BEACON TOWER climbed
  inside to 1720 up (the land's highest point: HIGHEST POINT IN OHIO), and the repair scaffold down the wall's raw end
  (moved there from the pagoda). Checkpoints 24-26.
- **Germany, THE BREWERY HILL:** the hay-bale keg catcher, the cobbled KEG RAMP up to the brewery yard, a full keg
  rolled down it every couple of seconds (the dock door, the teeter, the crew's KEG! first; `m2:fl_keg`), bursting on
  the bales; the BRAUHAUS (BEER: BUD LIGHT) a wall to its roof, climbed by the crates and the hop loft, down the drying
  racks and the stairs. Checkpoints 33-34.
- **Italy, IL FORNO:** the WORLD'S LONGEST PIZZA OVEN walked through, three burners flaring floor to ceiling in turn
  (the blue pilot first; `m2:fl_oven_fire`), or over its roof past the chimneys that blow on the off beat; then the
  terracotta houses up the hill (a Vespa, laundry over the alleys) and down the last one's balconies. Checkpoints
  44-45.
- **Japan, THE BULLET TRAIN:** two fiberglass Fujis (three steps tall, the snow paint) climbed over, the track between
  them; the SHINKANSEN (DOES NOT STOP) comes out of one tunnel and into the other on a timer (bells, red lights, the
  tunnel shutter rolling up first: the portals are shuttered, solid; `m2:fl_bullet_train` hits him hard and kills the
  cast); the signal gantries, the platform walkway, the station roof and the departure board are all over its roof.
  The attendant: PLEASE STAND BEHIND THE YELLOW LINE. THERE IS NO YELLOW LINE. Checkpoints 54-55.
- **Morocco, THE SOUK:** a covered market alley under striped awnings stepping up to the tea terrace (SWEET TEA
  (SOUTHERN)) and down; the CAMEL RIDE's fiberglass camels get loose on a timer and STAMPEDE down the alley (dust,
  rumble, bells, a salesman's shout first; `m2:fl_stampede`); the awnings are over their humps. The broken corral
  (GATE BROKEN, CAMELS: ALSO BROKEN). Checkpoints 64-65.
- **France, LE LOUVRE (GIFT SHOP):** the glass pyramid in steel-framed tiers, solid, climbed up and over to the MONA
  LISA (a postcard, ACTUAL SIZE* *SMALLER); the FOUNTAIN SHOW's nozzles in its steps jet in a wave across it (the
  gurgle first; `m2:fl_fountain` knocks him up and off); the Seine (A PUDDLE) and its bookstalls (the can-can pair on
  them), an apartment block over its mansard roof. Checkpoints 74-75.
- **The UK, THE WORLD'S TALLEST PHONE BOX** (reskinned 2026-10-16 from BIG BENJAMIN, the clock tower: Spooky Land
  already has one; the layout, collision, timings and hit areas untouched): a giant red British telephone box climbed
  inside (its far wall shut to the ground: EXIT: OUT THE TOP), THE HANDSET off the hook swinging on its coiled cord
  through the lower floors (the pendulum's arc and hit area: `m2:fl_handset`), the giant phone on the wall up top
  rattling (the tell) and RINGING a wave out (the bell's: `m2:fl_ring`; he may answer it, once: IT'S FOR YOU. IT'S
  ALWAYS FOR YOU.), coin boxes, phone books, INSERT 10P plates and taped-up calling cards on the walls, the lit
  TELEPHONE crown sign and the domed roof on top; out through the smashed glass panes onto the sill and down the
  outside by its red moldings (in through the panes the way back). The terraced street. Checkpoints 84-85.
- **Canada, THE FROZEN POND and THE TOBOGGAN HILL:** ice panels over the pond (REFRIGERATED, SORRY ABOUT THE ICE), a
  hockey game on it; the marked thin panels crack under whoever stands on them and give way (`m2:fl_thin_ice`, the
  cast THROUGH THE ICE!), frozen over again a while later (one-way: he can always come up through a hole); a hockey
  player's too-late SORRY. The snow stairs up to the SUGAR SHACK (SYRUP: $40), down the toboggan chute (TOBOGGANS:
  SOLD OUT), on to the helipad. Checkpoints 94-95.
- **Voices:** no new voice ids: the set pieces' barks are in existing cast voices (luchador, viking, fireworks,
  barmaid, pizza, cosplay, carpet, waiter, bobby, hockey); 11 new hurt sources with hurt + death lines.

## Decisions (job 5)

The user's HELICOPTER HARRY fight, built (harry/: arena.ts, scene.ts, rambo.ts, liberty.ts, fight.ts, lines.ts, index.ts).

- **The crash site** is the AMERICA pavilion's construction site (THE ONLY COUNTRY / COMING SOON, the land's lettering):
  he comes to by the helicopter's burning wreck in its crater (DOORS.harry.start, checkpoint 120), the big health + ammo
  a few steps on (REFILL_X), then through the gate of the left scaffold tower onto the poured slab. The fight's floor is
  ONE screen (the camera fixed at VIEW_X), Contra's way, between two scaffold towers (plywood hoarding up out of the
  shot: walls; the scaffold Harry hangs off). The gate slams shut (chain-link, padlocked) as it starts; open after.
  Behind the slab, the dig's dirt berm with all nine wrecked landmark mechs from the gauntlet piled along it in two rows
  (heli/mechArt's wrecks, painted once to a cached canvas; their fires live); the sky smoky at the hour.
- **The intro** (a cutscene: HUD hidden, SKIP >> skips all of it; a retry skips it: her up, him waiting): Harry down on
  the jetpack, it sputters out; green: "WHERE THE HELL ARE MY AIRSICK PILLS?" (the weakness, planted); "YOU WANNA MEET
  THE REAL HARRY?", the jacket, the tie-dye and the helmet torn off in shreds: jacked (pecs, abs, gray chest hair, a
  PEACE SIGN tattoo from the old days, a bandolier, the red bandana, still the glasses, the ponytail, the jeans and the
  socks and sandals), the flex; Meathead impressed ("...DAMN."); the rant (DAMN FOREIGNERS, the metric system, soccer);
  the user's line, verbatim; Harry calls her ("LADY! GET YOUR GREEN ASS UP HERE!"), she rises out of the dig (170
  frames of quake and dust); "A REAL AMERICAN MONUMENT."; on.
- **The Statue of Liberty** (liberty.ts, full detail): head, crown and upper body only (the berm hides the rest), patina
  greens in a 7-step ramp; the seven rays off the top of the shot; the crown's row of windows, the middle one a room
  Harry stands in (head and shoulders in it, clipped); a classical face that moves (stern, straining, disgusted,
  gagging, puking, sad, sobbing, dread); the stola's folds; the tablet (JULY IV / MDCCLXXVI). Her right (torch) arm is
  a two-bone arm drawn to wherever her fist is (rearing over him, its elbow kept off her face so the window stays in
  sight); the torch stays upright in her fist, its gold flame. Invulnerable: she isn't an enemy at all.
- **His moves** (fight.ts; numbers up top): WALK (slowly at him, M60 bursts head on at chest height, 5 rounds each: one
  jump clears a burst; or duck or slide under them); THE CROWN (a big leap up into her window,
  "LADY! SMASH HIM!"; her fist rears up over him, a shadow ring on the floor follows him for 70% of the windup, then
  LOCKS (flashing, an alert), the fist going hot; ~2.8 s the first time; down in 12 frames; under it is a big hit);
  STUCK: the fist planted on the floor (112x74), NO collision at all (the user, later: it hurts only landing on him; not
  standable, no wall, no cover: his rounds and sweeps go through; a plain square arena); 400 frames of her straining, shaking, grinding; Harry's rant from the crown (three escalating levels, the
  user's lines in the first two), then he's down walking him down; she yanks it free (anybody on it popped off);
  Meathead's "...SHE'S STUCK." once a visit. THE WALLS: sweep 1 off the far wall from him (level across, then rotating
  down to 74 px out from his own wall: safe only right under him), sweep 2 off the near wall (straight down, then a
  steady arc out across the floor and up the far wall to 170 px: get to the far end and uppercut late). A red laser
  sight shows the line (52 frames of it flashing and beeping first). The order: walk, crown; after each stuck arm
  alternately the crown again, or a sweep (alternating 1 and 2), a walk, the crown; under a third, two sweeps in a row.
- **The weakness** (opted in: weapons/crossbow.ts `setDartTaker` hands a boss's darts to its own fight, and the bow
  locks on to him): a dart does 2 (never his last point); 7 darts (a QUEASY meter over his head; it drains if he's left
  alone ~2.5 s) and he's sick: off the wall or out of the crown first; "OH NO. I FORGOT MY AIRSICK PILLS." the first
  time; the heaves; he barfs up onto her (green splats stay on her); she snaps standing (a stuck arm yanked free);
  disgust, the gag (cheeks blown out), then her concrete guts down on him: 150 (HEAVY), a splash that hurts Meathead
  within 120 px, a mound left on the floor; "IT'S SETTING!"; then, furious, straight up into her crown for the smash,
  the windup quicker each time (x1.25, x1.5 ... to x2.4). The meter's shut from the sickness till that smash lands: no
  sick-spamming.
- **Hurting him:** the ray gun and his moves in full, anything else 35%, the 60-frame breather; no instant kills (the
  engine's mid-boss rule: a `midBoss` kind). He's harmless to touch. In the crown his hitbox is the window.
- **His deaths:** the weakness (her concrete's the killing hit): the kill cam (slow, zoomed); the pour goes on, a mound
  builds over him face down, just his socks and sandals sticking out, kicking ("MMF! IT'S SETTING!"), setting still.
  Any other way: staggering, over on his back, the M60 still firing straight up, its recoil spinning him round on the
  slab (seen from the side: flipping) till it clicks empty; bandana down over his eyes, the seat of his jeans split
  (tie-dye underpants); "AMERICAAAA!". THEN, either way, her: she looks down (sad), sobs (a concrete tear, shaking),
  lets the torch go (it clangs down onto the slab), drops the tablet into the dig, brings a statue-sized patina-green
  revolver up from behind it, puts it to her temple (eyes shut, trembling), BANG: the far side of her head blown out
  (hollow concrete, rebar, dust; chunks across the floor), the gun drops onto the slab, and she goes over backward into
  the dig. Meathead: "SHE REALLY LOVED THAT ASSHOLE." / "SHOULD HAVE TAKEN YOUR PILLS." All of it skippable (all or
  nothing). VICTORY, the walk-away, the hub, Foreign Lands cleared.
- **Hurt sources** (hurt + death lines each): `m2:fl_harry_gun`, `m2:fl_liberty_fist`, `m2:fl_harry_sweep_down`,
  `m2:fl_harry_sweep_up`, `m2:fl_liberty_barf`.
- **Lines:** every Harry group in clean / shitty / naked pools (queasy, rip, rant, summon, taunt, fire, crown, three
  stuck levels, unstuck, both sweeps, hurt, gloat, low, sick first / later, concreted, follow-up, both deaths); the
  user's verbatim lines whatever his state. No slurs. Meathead sparse (impressed, the user's line, a crossbow hint for
  anything else now and then, the stuck arm once, the concrete once, the last word). She never talks (rumbles, grinds,
  gags, sobs). No new voice ids (Harry's is job 4's).
- **Revisits** (the land cleared): the slab empty, her rubble (concrete and green shell, a crown ray, her nose), the
  revolver and the torch lying, a chalk outline, his tie-dye in shreds, the spent jetpack; the gate open; the wrecks
  still burning on the berm. The way back to the helipad is the left end.
- **The walk-away** (walkAway/helicopterHarry.ts, replacing the placeholder): back across the slab (joints, scorch, her
  concrete set in puddles, spent brass), the dig behind him with the wrecks' silhouettes burning and her hand up out of
  the rubble; her blown-open head, the revolver, the torch, chunks, shreds, the jetpack; Harry's fate (the mound and
  his feet, or flat on his back).

## Decisions (heli rework)

The user (2026-10-16): "not a fan of the appearance of the helicopter section. the scale is sold poorly. should look
like i'm going around the park like the clearing in the adventure stage. it should look more zoomed out. harry
shouldn't be in the scene. he should be on the ground chasing you and yelling at you, controlling the animatronics";
then "a major visual refactor ... boss mechanics are fine-ish"; "give some anticipation before the first monument's
appearance, the eiffel tower, as it rises from the ground, ready to destroy you". Mechanics kept (controls, patterns,
timings, HP_SCALE 2, one wave each, Pisa, checkpoints).

- **Zoomed out:** the stage zoom at Z 0.65 from the lift on (geo.ts), about the screen's middle; the flight field is
  the screen over Z (1231x923 world). Patterns and lackey spots laid out for 800x600 are mapped into it (fx/fy); the
  Colosseum's walls are seven rows of three down the taller field, one open. Speeds stay world speeds (the zoom just
  shows more room). The engine counts the zoomed view as the screen while flying (GameState.viewIsScreen, opt-in via
  screenRect), so goons out at the field's edges can be shot. The HUD, the bar, prompts and subtitles are screen space.
- **The circuit (park.ts, the clearing's orbit trick):** one camera going round a ring looking in at the park's middle;
  the floor Mode 7 (chunky, banded haze); everything back to front through the one eye. The park: the lagoon and its
  promenade; the ten pavilions he walked, in his order, as small crude solids (lit faces in steps); trees, tiny guests;
  a hedge; THE CIRCUIT the nine landmarks stand round on plinths (the Eiffel Tower's behind France); the service road;
  the parking lot; fields; the other lands on the horizon (castle, needle, sign, volcano); the sky by the hour; clouds
  drifting below him. Scale: a landmark's about as tall as the park is wide, a pavilion knee-high to it.
- **Seamless hand-off:** the camera's fitted so the landmark round in front lands exactly on BASE at the field's scale:
  out on the ring it's the park's (drawn in the backdrop), up and fighting it's the world's (its boxes), same spot.
  h.prog turns the park (the next one ahead round the ring, right and further off; the ones after across the back; the
  wrecks where they fell, on scorched plinths, painted once each to a cached canvas). The tour turns the park 2.6 steps
  round to the Eiffel Tower; the nine take one lap.
- **The lift:** up off the pad zooming 1 -> Z, the park's camera climbing from near the ground, faded in over the
  streets (no cut). The tour is the flight's view.
- **Harry on the ground:** shoved out, he falls all the way down onto the service road, flat on his back; up, red-faced,
  the ride's REMOTE out (a brick with an antenna, a red button), the act dropped, he wakes them (eyes on, shut: asleep).
  Flying, he chases along the road a little behind the helicopter (on foot; too far behind, a jetpack hop), stops to
  key the remote while a landmark arrives; drawn at 0.78 with a shadow; words over him (saidOver, whole on screen). No
  hitbox. The end: he stops under the helicopter, tips the launcher up and fires from the ground. One line changed
  ("FROM UP HERE" -> "FROM DOWN HERE").
- **Each landmark ARRIVES (mechs.ts arrive):** no hurt possible (the air's cleared, it has no boxes), his controls free.
  Beats: the ground at its plinth rumbles and cracks (spreading through its pavilion's plaza), the replica shaking,
  dust, the guests scattering; the ground swallows it; a beat under, heaving; it bursts back up on folded mech legs,
  debris, the view pulling back 13% to take in the size of it; it stands; its eyes SNAP open (klaxon, roar); a beat of
  stillness, its line; it attacks. The Eiffel Tower's takes 330 frames (~5.5 s), the rest 200 (~3.3 s). Its bar fills
  as it arrives.
- **The look:** the mechs rebuilt (mechArt.ts): a hip chassis with hazard stripes and a warning light, armored piston
  legs, three-toed feet; each landmark lit in steps with its shadow side and details (the Eiffel's lattice and decks and
  a flag, the Opera's sail undersides and glass, Big Ben's gothic panels, the Colosseum's three tiers, the moai's red
  topknot ...); bigger googly eyes with lids. Shots on a dark halo with a flashing rim, a size up; beam warnings dashed
  over a dark line; drop columns outlined, a big "!". Blasts: a white flash, banded lumpy fire, a shock ring, chunks.
  The helicopter: stepped shading, an engine cowling, panel lines, nav lights and a strobe, a banded rotor blur.
- **Also this pass (separate commits):** the checkpoint bug (dying at the Opera House restarted at the Easter Island
  head: the nine checkpoints share one x and the walk-past loop fired them all on respawn; now manual); a big health +
  ammo after every landmark; the rotor boost's own recharge (14-frame cooldown, a boost every 30 frames: twice a
  charge on foot), never his power cells, a BOOST meter by the rockets.

### Follow-ups (the user's playtest notes, same pass)

- **The jacking, shown:** after "SHUT UP, HIPPIE." the view punches in on the cabin (the zoom's pull about the cabin,
  the park's camera with it); Meathead's cutscene kick; WHAM; Harry out the door, flailing, yelling; the helicopter
  wobbles; back out as Meathead slides into the pilot's seat; Harry's fall and landing as before. The tour trimmed to
  Harry's welcome, the bigger landmarks ("IN AMERICA, EVERYTHING IS BIGGER. EVEN OTHER PLACES.") and the straws, with
  Meathead's "UH HUH." and "I DON'T WANT A STRAW." kept.
- **The rotor always chops** any of the lackeys touching its disc (the boost's own shred kill, its callout), boosting or
  not; it never hurts him. The disc's line turns with the helicopter.
- **The boosts turn it:** right + B a quarter over nose down, left + B a quarter over backward, down + B upside down, up
  + B upright: the rotor leading, blades first; snappy into it and back.
- **The arrivals come from all over the park, close:** each landmark comes up somewhere of its own (park.ts RISE: out of
  the far parking lot, the lagoon, behind its pavilion, off to the side) with the camera still short of it, then STOMPS
  in to its plinth as the camera comes the rest of the way round (exactly there as its fight starts). The pavilions are
  placed so each landmark with a country stands by its own (France, Italy, the UK, Morocco).
- **The ruin (looks only):** each landmark's walk in tramples a path: footprint craters, flipped cars, pavilions caved in,
  fires and smoke along it; fires round each plinth as its fight goes on. Worked out from where the landmarks have got
  to, so it stacks up (the park's a burning ruin by the Easter Island head) and comes back as it was at a checkpoint;
  the fires glow through the lighting (the section's lamps). Car alarms, crashes, screams, splashes as it stomps.
- **The landmarks** a little tougher (HP_SCALE 2 -> 1.6) and hit harder (MECH_DMG 1.3: shots, beams, drops, minions,
  contact; not the Leaning Tower's fall, not the lackeys).
- **The lasers** (the Eiffel Tower's and the Pyramid's): narrower, a longer warning, then a LOCK (22 frames, held still,
  flashing white the width it'll fire) before it fires, and slow following once firing; every beam can't hurt him
  during the first 12 frames of a boost, so a boost through a beam clears it.
- **No ammo up here:** the refill after each landmark is health only; the lackeys drop health only (FLY_DROPS), the
  park's table back on the ground.
- **Rockets:** kept (ROCKETS_ON, one line to switch them off), the recharge 50% longer (225 frames a rocket).
- **His pose in the seat** (render/player/copterPose.ts, Player.copterSeat): bored and slumped, arms crossed, on the
  tour; flying, hunched over the controls, elbows out, the cyclic and the collective, boots on the pedals; leaning into
  boosts, the stick jittering while he fires, yanked back for an up boost, hanging off his belt upside down, a snarl
  after a kill, a flinch when hit; jeans, shat or bare as he is.
- **Harry never says a line twice in a life:** one set (heli/talk.ts harrySaid) cleared each stage build, every Harry
  line in the helicopter and his arena picked through harryPick (unsaid ones, then the 45 s rule); a pool run dry, he's
  quiet for it. His shitty and naked pools get the clean ones on top. His pools rewritten and grown, the swearing varied
  (motherfucker, cocksucker, shit-for-brains, dipshit, fuckwit, douchebag, sumbitch ...), no slurs; the arena's rant and
  summons cut to about half; the stuck-arm rant's last level (it repeats) twelve lines.
- **Harry's arena:** his arms in the rant, the command, the flex and the fall bend out, not in over his head; her arm
  eases between its elbow sides (no pop), stays inside the arena (clipped to it: past the end walls she's behind them),
  and smashes near straight; the stuck fist has no collision (above); a retry gives him a 1.75 s entrance (flexing, a
  taunt, no fire) before it's on; his bursts are 5 rounds (one jump clears one); her revolver's drawn in front of her
  head at her near temple, a sobbing beat before the shot.
- **Lackeys during the fights** (goons.ts fightGroup): a small group every 8-12 s while a landmark's fighting (not while
  it arrives, not at the Leaning Tower), from in front, behind, over and under, 2 to 4 of them as the gauntlet goes, no
  more than a handful out. **The rockets go for them first** (the nearest on screen), the landmark only when none's up.
- **Harry to her like a lousy husband** (the user's lines and more, in the crown, stuck-arm and unstuck pools): "LOOK AT
  WHAT YOU MADE ME DO.", "YOU NEVER LISTEN.", "I GAVE YOU EVERYTHING. I GAVE YOU A TORCH.", "I'M NOT MAD. I'M
  DISAPPOINTED." ... Verbal only; it pays off her heartbreak when he's dead.

## Decisions (Harry: the statue wears out, 2026-10-16)

The user: "if the statue of liberty smashes enough times it will crumble and fall apart. this means no suicide after
death or further arm smash moves. harry will speed up a bit in rage to make up for it. he will do his wall attacks more
often. the statue gets more cracked the more often it does it."; "he has 'grieving sickness' now in addition to 'air
sickness'"; the barf-to-death; "harry takes more shots to make queasy too".

- **Her arm and torch (sculpture):** smooth copper volumes, the robe sleeve one carved mass with folds and a riveted
  seam, gentle eased elbow bends; the gilded torch gripped in her fist. The smash drives the torch down handle first like
  a stake: its butt lodges in the floor, flame on top; silent while she tugs; dirt trailing on the yank.
- **Wear (fight.ts STATUE_LIFE = 6):** every smash cracks her more (cracks, chips showing her concrete, the patina
  flaking to bare copper), bits of her raining onto the floor. The 6th smash is her last: stuck, she comes apart
  (CRUMBLE_T 170 frames: cracking all over, shaking, the torch dropping where it was stuck, down into the dig in pieces);
  Harry down out of the crown to watch, horrified (HARRY_CRUMBLE).
- **Without her:** no crown, no smash, no stuck arm; Harry ENRAGED: walks 35% faster, his gun's rests 35% shorter, his
  walks about half as long and walls queued twice as often (cling, walk, cling), quicker up them; HARRY_ENRAGED taunts.
- **The weakness without her (fill-in, user approved):** the crossbow still makes him sick (QUEASY_DARTS 7 -> 10, with
  her or without; the meter notched a dart); with nobody to puke on he doubles over puking (grief AND airsickness:
  HARRY_GRIEF_SICK; Meathead's "GRIEF PUKE. NEVER SEEN THAT." once) for GRIEF_T 200 frames: it costs him 60, every hit
  in it at least 75. Dying in it (or from it) is his third death, BARFED TO DEATH: on his knees by her rubble, four
  heaves, each bigger (green-brown, then bloody), pale and deflating, face first into the pool, gurgling, one last
  heave, a twitch, still ("PUKED HIMSELF TO DEATH!" over him). The kill cam, as the concrete death.
- **His deaths:** any (the standard spin, buried, barfed) with her gone plays alone: no heartbreak, no revolver.
- **Buried (with her):** his arm out of the top clawing, then set flipping the bird; the top of his head and the
  bandana's knot out the slope; blood seeping out through the cracks into a pool round the foot, stained chunks.

## Decisions (heli: 3D landmarks, 2026-10-16)

The user: "make the landmarks in the helicopter portion 3d modeled so the perspective looks more correct when you move."

- **A software renderer (heli/mesh3d.ts), no WebGL:** meshes in code (vertices, convex faces, a material and an
  optional painted decal each), through the park's one camera (park.ts proj); faces turned away culled, the rest sorted
  back to front and filled flat, each lit in steps off its material's five-step ramp (a 2x2 dither where a face falls
  between two), edged a step darker, the silhouette inked. Groups move as one (the Opera House's shells, the Redeemer's
  arms, the Leaning Tower leaning, the Taj's minarets, the moai's head and body); parts are what fly off.
- **The nine (heli/models3d.ts), each the size of its flat art:** the Eiffel Tower's four raking latticed legs, arches,
  decks, tapering lattice and mast with its flag; the Opera House's podium steps, gold-mullioned glass and six tiled
  shells, their mouths in shadow; the Redeemer's pedestal, flared robe, arms and head; the Leaning Tower's ten-sided
  drum in eight arcaded tiers with ledges, its belfry; the Taj's terrace, chamfered block with its iwans and niches, the
  drum and onion dome, four chhatris, four minarets; Big Ben's three stages of gothic windows, buttresses, a clock face
  on every side (hands going), belfry, green spire, gold pinnacles; the Colosseum's elliptical ring (three tiers of
  arches and the attic, broken down on the right), the seating down into the arena, its sand; the Great Pyramid's stepped
  courses and gold capstone with its eye; the moai's head (brow, nose, lips, chin, ears), its red pukao and the body
  that rises under it. The mech under each built per frame: chassis with hazard stripes, exhausts, a blinking light,
  jointed legs (steel thighs, chrome shins, yellow knees, three-toed feet) posed by the stomp and the walk in (each foot
  where it is on the park's ground). The replicas' plinths too.
- **The camera:** each model's front faces the camera it's fought from (the fight's view is the old one's), placed on
  its plinth (or where it's walked to) on the park's ground. The one he's fighting is drawn in world space through the
  same camera fitted to the field (park.ts camFit), exactly where its boxes are. Verticals kept upright about each
  one's base (a tilt-shift: the towers stand straight on screen and match their boxes; their ground is the park's).
- **Light:** from the viewing camera's upper left (the flat art's: the shadow side down the right), its height the
  hour's sun (high at midday, raking at sundown), colored by the hour's light. Kept to the camera so every fight is lit
  the same way round; the faces still change as the camera goes round them.
- **Wear:** a hit's flash (the faces flashed pale); cracks and scorched faces spreading as its health goes; dying, about
  40% of its parts blown off one by one, flung and tumbling; the wreck blackened, lying on its side by its folded legs,
  smoking (the Leaning Tower lying where it fell). Googly eyes are billboards on its front (hidden when it's turned away).
- **Cheap:** a few hundred faces each; the replicas still to come and the wrecks painted once to a canvas each and
  blitted while the camera's still (every fight); details (decals, small parts) dropped when one's small on screen.
  Hitboxes, patterns, timings, arrivals and the stomping are as they were. Harry's arena still shows the flat wrecks.
