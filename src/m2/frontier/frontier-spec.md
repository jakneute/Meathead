# Wilderness Land: the spec (for every section owner)

Land id `frontier` (on screen: WILDERNESS LAND). Read this, then `OWNERSHIP.md` (who owns what, the shared files,
the length budget), then your section's index.ts header. Study how Jungle, Spooky, Space, Hollywood and Foreign Lands
are built (src/m2/adventure, spooky, space, hollywood, foreign) and reuse what they share (adventure/section.ts
helpers, the time of day, signLetters, pickLine, the grab, victory, walkAway, drown.ts, hazardHit.ts).

## The user's brief (verbatim)

> got wilderness land fairly well spec'd out.
>
> we start out in the American frontier. a wilderness area with bear traps and various other appropriate obstacles and enemies, like deer and wolves. throw in some interesting mechanics and make it fairly platform heavy like the start of jungle land (formerly adventure land). when you get to the end of the sequence you meet a cheery train conductor. it's the 1800s - or rather - a theme of it and these newfangled railroad tracks are incredible at getting you to new destinations fast. the chipper train conductor - named 'tucker the train conductor' cheerfully asks for your ticket to visit a nearby mining and logging town at this remote train station.
>
> meathead of course doesn't have a ticket and just punches he way through. this pisses off the conductor and he runs to his engine "no one boards my train without a ticket!" and speeds by. meathead jumps on the train from the caboose and must make his way through the train to the engine to give the conductor a piece of his mind.
>
> there will be a split between trains that you can enter and trains that can only be visited from above. tucker will occasionally dislodge the train you are currently standing on, meaning you better not dally. or your car will get derailed and you'll die a silly violent death. there will be tunnels that go by and darken up the area as it goes through. the tunnels get more plentiful as you progress, limiting visibility but not making it completely dark. there of course will be various train obstacles and enemies along the way.
>
> eventually you'll get to the front of the train engine with a big arrow saying 'kill'. similar to riggs in meathead 1. you just shoot him once from outside and it shows a closeup of a hole going through his eye, apparently dead and the train crashes into the stop at the nearby mining/logging town.
>
> you then face a sequence of characters in this logging/mining town going through the town and the mines for a bit until you hit the log ride. as you cut ahead, tucker isn't done. he has a hole in his head but is somehow still alive. when meathead jumps into the log ride he goes 'time to engage the buzzsaws' at the ride controls, shoving the actual ride operator out of the way. when he presses it, a buzzsaw falls from the ceiling and cuts a huge hole in his forehead. show a closeup of this. his missing eye and his splitting headache. he falls over again, apparently dead and now you need to do a tracked section log ride with various buzz saw obstacles along the way.
>
> the end of the line is a woodchipper. you gotta jump out at that moment or else you get a funny death animation. after the woodchipper you are now in a wooded area, apparently outside the bounds of the park because there are various kids on dirt bikes driving around. meathead just callously kicks one of the teenagers off his bike and goes 'mine'. right afterwards - tucker - now extra bloodied, pops up out of a nearby leaf pile and also ambushes and knocks off one of the teenage riders and hijacks his bike. he apologizes and proposes this to the teens: "20 bucks for the first one to give me that meathead's head". the teens happily oblige and now you race through some dirt terrain on a dirt bike as dozens of teenagers on dirt bikes are coming after you.
>
> i want to try something ambitious with the dirtbike sequence: make it look like road rash on genesis. X (or left click/shoot) will attack left B (or right click/charge) will attack right, A will jump. don't make it look like mode 7 but using the visual effects genesis games would use to simulate driving on a turning road. there should be various obstacles on the side of the road like trees/cows/other wildlife that you can bail into and crash, causing heavy damage and a quick respawn (it doesn't kill you unless low on hp). the teenagers use weapons but instead of stealing the weapons like in road rash, meathead can 'parry' the attacks by attacking at the same time and instantly eliminating them. like when they swing a bike chain, you grab it swing the teenager over your head and toss them forward, exploding in a small human bomb ahead of you. come up with a couple other funny 'punch parries'. this is considered a sub boss: "teenagers".
>
> at the end of the sequence, go back to sideview and meathead catches up to tucker. he goes "you took them all out?" he gets furious. he cannot stand people cutting line expecting a free ride. he "doesn't give hand outs". eventually he crashes into a tree with a pointy branch that impales him through his chest. show this in detail. he is missing an eye, has a buzzsaw in his forehead and is impaled on a giant tree branch through his chest and he crashes. you approach the body in the area and meathead goes "are you going to fake me out again?" yep, he does, he pops up like a jumpscare (he does this every time, coming back from the dead). the real fight against him begins here.

## Fill-ins (not the brief: decided since)

### The user's, given after the brief (treat as the user's design)

- **The new traversal mechanic: ROLLING LOGS.** Floating logs on water: stand on one and it rolls under his feet;
  walking steers/propels it across a river or pond; stop walking and it drifts and slows; it bumps into things. Taught
  early in a safe spot, then built around (logs + rapids, logs + enemies, a log ride across a gap). Meathead's own
  log-rolling pose (feet pedaling). Simple.
- **The walk-away weapon: the FLINTLOCK** (store.ts LAND_WEAPON).
- **Tucker is drawn at full detail from the first pass** (on par with Donnie and Safari Artie). His wounds STACK
  through the land (the eye, then the buzzsaw, then the branch) and carry into his fight.
- **Tucker's inspiration (the user's):** heavily inspired by a character in *Cannibal! The Musical* (Trey Parker) who
  just can't seem to die. Play it that way: absurdly unkillable; each "death" sold as final; each comeback more
  mangled and more stubbornly chipper / indignant; never explained.
- **Tucker's character (the user's): his sin is GREED as indignant bookkeeping.** Not money: a minor inconvenience
  (one unpaid fare) consumes him, and he stops at nothing to collect what he's owed. The model: South Park's Mel Gibson
  episode (Mel chasing the kids violently through the streets, pulling manic funny faces, "GIVE ME BACK MY 17
  DOLLARS!"). So: manic, petty, cheery-turned-unhinged, ledger talk (the fare, plus interest; nobody rides free; "I
  don't give handouts"), never brooding rage. His sprite has a `manic` face (one eye bulging, one a pinprick, a brow up
  in his cap, a clenched grin of every tooth) for the rage, the run to the engine and the cab.
- **The mutilation close-up rule (the user's standing rule for Tucker):** EVERY time Tucker is mutilated (the eye shot
  through, the buzzsaw into his forehead, the branch through his chest, the grizzly's mauling, and anything later in his
  fight), show a graphic ANIMATED close-up of it happening: a full-detail, multi-frame, gory cutscene close-up of the
  wound being made, not a still of the result. `tucker.ts` has the close-up renderer (`drawTuckerCloseup`) with a
  wound-in-progress hook (`making: { wound, k }`, painters registered per wound with `registerWoundPainter`).
- **The fight isn't designed yet:** the arena is a placeholder end; don't invent the fight. Section 7 ends after the
  jumpscare at the placeholder.
- **Tucker's STANDARD death (for the fight, later):** he falls over, apparently dead; Meathead walks up to him; Tucker
  pops up "AAHHH!" (his usual jumpscare); then a grizzly bear comes out of nowhere and mauls him to death for good, body
  chunks flying everywhere (the close-up rule applies to the mauling). His weakness-kill death: with the fight (TBD).
- **The log ride's order:** the tracked ride with its buzzsaws, its LAST stretch in a SEWER (he veered way off the
  intended track), then the theme-park log flies out into an ACTUAL river, and that river ends at the WOODCHIPPER.
- **The land's running joke: "Wilderness Land" ends up in the ACTUAL wilderness.** Up to the log ride it's all theme
  park fakery (fiberglass rocks with their bolts showing, plywood frontier fronts, painted mountain backdrops on flats
  with their bracing, park signage, trash cans, guests); then the sewer; then real nature outside the park (a real
  river, real woods, local teens on dirt bikes; a busted perimeter fence, a PARK PROPERTY ENDS sign). The wilds (section
  1) are clearly the PARK's version of the wilderness (the park stocked it with real animals "for authenticity", as Jungle
  Land's jungle), not the real thing.
- **The walk-away spin (after Tucker's boss kill only):** the walk-away says HEADING BACK TO PARK, and instead of
  returning to the hub, Meathead starts from the PARKING LOT (the intro's lot, src/m2/intro) and walks back into the park.
  At the intro's ticket window again (TICKET_LADY etc., src/m2/intro) he and the ticket lady have a short, funny re-entry
  exchange (he already went in: a hand stamp? the re-entry policy? he's soaked in blood and sawdust...), clean / shitty /
  naked, fitted round the intro's ticket logic (naked = no ticket = he knocks her out). **Not wired yet** (a later job:
  the intro's lot needs a re-entry mode, and walkAway.ts a title option). Exiting the land from the pause menu ALWAYS
  goes back to the hub as normal, even from the out-of-park sections after the log ride ("we're not fighting logistics
  here"): the parking-lot return is only the post-boss walk-away.

### Ours (the skeleton's and section 1's)

- **The mining and logging town: SAWDUST GULCH** (the station's sign, Tucker's pitch, the town's stub).
- **The station:** a remote frontier whistle stop at the end of the wilds: a plank platform, a depot shack with a
  ticket window (CLOSED), a water tower, the bell, the timetable board, the tracks running off right, Tucker's train
  waiting (a 4-4-0 engine with a cowcatcher and a balloon stack, its tender, a coach, the caboose).
- **The punch is played, not scripted:** after Tucker's ticket pitch (a cutscene), Tucker stands in the way at the
  platform's gate with his hand out; the player hits him (any hit, any weapon: he's unkillable here, a mid-boss stand-in
  with no health bar). Down he goes, up he springs, furious: the close-up of his face ("NO ONE BOARDS MY TRAIN WITHOUT A
  TICKET!"), he runs to his engine, the train pulls out and speeds off; Meathead runs after it and the scene ends at the
  train section's start (job 2 builds the caboose jump-on).
- **Wildlife (all new kinds, `m2:fr_*`):** the doe (bolts, then kicks with her hind legs), the buck (antlers lowered:
  charges; pointy, so a charge into his antlers is punished), the gray wolf (packs: circles, then lunges low), the cougar
  (up on ledges, pounces down), the beaver (in the water: surfaces by his log, slaps and bites; registered a swimmer),
  the rattlesnake (in its hole: rattles, then strikes), the crow (swoops), the porcupine (quills up: spiky, so a dive kick
  onto it is punished; charge or slide it), the bison (a slow, huge charger: knocks him far, and plows through whatever's
  in its way). (Superseded by the 2026-10-18 playtest fixes in the log: the deer, wolves, cougar and bison are big
  game, not critters; the trout added.)
- **Hazards of ours:** bear traps (snap, hold him, damage; mash to pry free; animals step in them too), pine cones
  (a big pine shakes, then drops one), rolling logs off a log pile down a slope (jump them), loose cliff edges (crumble a
  moment after he stands on them, re-form later: never lock the way), a beehive (shoot it down: the swarm goes for
  whoever's nearest, wolves included), rattlesnake holes, the rapids (current, submerged rocks that buck the log, low
  branches over the water), the falls (the log boom at the end of the long river: hit it fast and he's pitched over; the
  gap past it is the drop: a set-piece death with its own death screen).

## Section plan (world x; FRX = 700000; checkpoints numbered across the land)

| # | Section | id / folder | x range (world) | Checkpoints | State |
|---|---|---|---|---|---|
| 1 | The frontier wilds + the station | `wilds` | FRX+0 .. FRX+21000 | 0-9 | built (section 1 job) |
| 2 | The train | `train` | FRX+24000 .. FRX+38300 | 10-19 | built (job 2; playtest fixes B) |
| 3 | Sawdust Gulch + the mines | `town` | FRX+39000 .. FRX+54800 | 20-29 | built (job 3; playtest fixes C) |
| 4 | The log ride (ride, sewer, real river, woodchipper) | `logride` | FRX+56000 .. FRX+67900 | 30-38 | built (job 4; playtest fixes D) |
| 5 | The woods (outside the park) + the bounty | `woods` | FRX+68000 .. FRX+71000 | 40-41 | built (job 5) |
| 6 | The dirt-bike chase (TEENAGERS sub-boss) | `dirtbike` | FRX+74000 .. FRX+84000 (side view: the first 1800) | 50-55 | built (job 6) |
| 7 | The catch-up + Tucker's arena | `arena` | FRX+87000 .. FRX+91000 | 60-69 | catch-up, impalement, fake-out built (job 7); the arena entry (the axe tree, the split, blind) built (job F); the fight a placeholder (job G) |

Gaps of 3000 between sections (grow your x1 into the one after yours). The stubs: flat ground, a frontier sign naming
the section, a COMING SOON board, one checkpoint at the start, walk off the right end into the next section (and back
off the left end). The arena's stand-in: walk past its middle: VICTORY, the walk-away (`walkAway/tucker.ts`, the
FLINTLOCK), the hub, Wilderness Land cleared.

### Section 1: the frontier wilds (x from the section's start)

Teach, then escalate (each hazard alone in a safe spot first):

| x | Stretch | What |
|---|---|---|
| 0 | THE TRAILHEAD (cp 0) | the land's gate sign; a doe grazing; the first bear trap alone on flat ground (sign: BEAR TRAPS ARE AUTHENTIC); the first pine dropping a cone |
| 1400 | THE ROCKY RISE | fiberglass ledges up to a ridge; a crow; a trap on a ledge landing; the first loose edge (safe drop under it) |
| 2700 | THE POND | the first rolling log on still water, alone (sign: LOG ROLLING); falling in is just a swim |
| 4500 | WOLF WOODS (cp 1) | two wolves; a trap in their path (watch one step in); a beehive over a pack (shoot it down on them) |
| 6200 | THE CREEK | two logs (tied up at the near bank) and a stepping rock; the first leeches (sign: LEECHES. RIDE THE LOG.); the first trout alone; the first fallen tree to duck, alone; a beaver; a crow |
| 7800 | THE BLUFFS | a cougar on the bluff; a chain of loose ledges over a ravine (they come back a few seconds after they drop: the way back's the same) |
| 9300 | SNAKE FLATS (cp 2) | the first rattlesnake hole alone, then two with a trap between; a porcupine (no dive kicks) |
| 10400 | THE RAPIDS | current; two channels and a rock island; submerged rocks buck the log; low branches; beavers |
| 13100 | BISON MEADOW (cp 3) | a bison; bucks; the log pile rolling logs down the hill he climbs |
| 15200 | THE LONG RIVER | one log down a long river: wolves and a cougar on fake-rock overhangs over the water (they leap down at him), a hive hanging off one, beavers, crows, a fallen tree to duck; the log boom and the falls at the end: jump off to the far cliff |
| 17800 | THE LAST MILE (cp 4) | a wolf pack, crows, the trap gauntlet with ledges over it, the tracks begin |
| 19300 | THE STATION (cp 5) | Tucker, the train, the scene |

### Section 2: the train (train/layout.ts: 22 big cars, caboose at x0+700, engine's nose at x0+13912; x1 FRX+38300)

| Cars | Checkpoint | What |
|---|---|---|
| 0-2 | THE CABOOSE (cp 10) | the run for the caboose (a cutscene); an empty boxcar: the first LOW BRIDGE alone; the first CUT, alone, on a flatcar of logs |
| 3-4 | THE COACHES (cp 11) | passengers (parasols, canes), a porter, the racks to climb; the first grade (gentle); a brakeman alone on the ore hopper |
| 5-7 | THE BAGGAGE CAR (cp 12) | the first tunnel (short, while he's inside); a porter among crates and shelves; a steer in a cattle car (the hayloft); a dip; the second cut, a brakeman on it |
| 8-10 | THE DINING CAR (cp 13) | the cook, passengers, tables and shelves; THE FIRST WATERFALL (short: the diner and a coach to duck into); the first robber riding up alone, then two; a climb; a tank car with a brakeman |
| 11-14 | THE WATER TOWER (cp 14), THE MAIL CAR (cp 15) | the first water tower over a coach (get inside); the third cut with a bridge coming; a tunnel; two steers; a drop; two porters; robbers |
| 15-17 | (from cp 15) | THE LONG WATERFALL over the open cars (the hopper: get back into the mail car or on into the diner); a steep climb; the long tunnels; the cook in the dark; the fourth cut, quick, in a tunnel, with a brakeman; a steep drop |
| 18-19 | THE LAST COACH (cp 16), THE LOG CAR (cp 17) | a water tower, robbers, a bridge, the steepest climb, a long tunnel; the stack's cinders from car 19 on |
| 20-21 | THE ENGINE (cp 18) | the fireman's coal on the tender; Tucker's insult (a cutscene), the KILL arrow, the rant; only the ray gun gets him (he ducks the rest); the shot, the close-up, the crash |

### Section 3: Sawdust Gulch and the mines (town/layout.ts; x from the section's start)

| x | Stretch (checkpoint) | What |
|---|---|---|
| 0 | END OF THE LINE (cp 20) | the crash (a cutscene: the engine through the stop into the depot, the cars jackknifed, Tucker thrown out face first, paramedics carry him into FIRST AID), then its burning wreck for the visit; the depot |
| 800 | MAIN STREET (cp 21 at 2000) | deputies (alone, then the bank's balcony), the snake-oil wagon (tonic clouds), the water tower's deputy, the barbershop quartet, the undertaker (the empty coffin: TUCKER) |
| 3800 | THE SALOON (cp 22 at 3700) | calm (cards, drinks, the kick line, the piano) till he starts something: BRAWL!, the batwings barred, the camera on the whole room, everybody at everybody (bouncer, 2 dancers, 8 drinkers); last man standing: the locked back door opens. Starts nothing: the bouncer starts it (16 s) |
| 4900 | THE ROOFTOPS | out the back into the alley; false-front roofs over alleys (crates back up), deputies |
| 5960 | THE SHOWDOWN (cp 23 at 5920) | the Wild West Show's street: gates shut, the intro (a cutscene), the duel (a clear lane: his mark, the sheriff's); DRAW!: in time wins, too slow the face-hole death, before it the posse (2 waves) |
| 7000 | THE LIVERY, THE SMITHY | farmhands (pitchforks: pointy), the hay loft, the blacksmith (hot horseshoes) |
| 8100 | THE MILL POND (cp 24 at 8250) | the bank feller's TIMBER! alone; pond A, one log; the island feller drops his pine across the water; pond B, the BIRLER ramming; the JACK LADDER up to the deck (the log lies along the chain, him tilted with it) |
| 9800 | THE SAWMILL (cp 25 at 9840, on the deck) | belt one into the head saw (a log goes in first), over the saw onto belt two coming back with logs on it; a feller at the end |
| 10800 | THE LUMBER YARD | fellers with hatchets; the mine's entrance |
| 11300 | THE MOTHER LODE (cp 26 at 11050) | down the shaft's landings into the murk; a singing canary; the first cave-in alone; miners (candle hats: spiky) round a TNT crate; an ore chute |
| 11860 | THE CART TRACK | runaway carts (warned: jump them or the alcoves); a cave-in over the rails; a TNT crate in their way |
| 12230 | THE TRESTLE (cp 27 at 12265) | the ride cart over the chasm, low beams (duck), a prospector lobbing dynamite at the far end |
| 12670 | THE GAS (cp 28 at 12680) | the dead canary, FIREDAMP (a shot in it sets the pocket off), a prospector past it |
| 13000 | THE FLOODED SHAFT | a long swim (1420 wide) under the rock, down under a low hump and up; no air pockets |
| 14420 | UP AND OUT | landings up into the daylight; the shaft's mouth fenced at its edges, the ground beside it |
| 14690 | TIMBER TUMBLE (cp 29 at 14760) | the log ride's long queue (switchbacks three rows deep on a stepped deck, WAIT FROM HERE boards 90 / 75 / 60 / 45 MIN, bored guests, the flume behind), the station's marquee; off the right end into the log ride |

### Section 4: Timber Tumble (logride/layout.ts; x from the section's start; one flume, left to right, the log on it)

| x | Stretch (checkpoint) | What |
|---|---|---|
| 0 | THE STATION (cp 30) | the platform, the booth (the operator barks as he cuts), the waiting log: drop into it: the booth's scene (Tucker, the shove, ENGAGE THE BUZZSAWS, the saw, the close-up, flat) |
| 1000 | FIBERGLASS CANYON (cp 31) | WALL SAWS (bulkheads down to head height: duck), alone, then two, then a pair; a settler shredded |
| 1800 | BEAVER CREEK | RISING SAWS (the water boils, then up out of it knee high: jump), alone, then two; the beavers shredded; the spiel |
| 2500 | THE LIFT HILL (cp 32 at 2480) | the chain, slow; SWINGING SAWS on gantries (duck as one comes through), alone, then a second |
| 3000 | THE OLD SAWMILL (cp 33 at 3020) | the shed; DROPPING SAWS out of the rafters (a shudder and a red lamp, the slam: brake or paddle through the gap), alone, then a pair, then one more; the lumberjacks shredded |
| 3900 | THE BIG DROP | out of the shed down into the splash pool; the ride photo's flash; soaked guests on the bridge |
| 4250 | THE LUMBER CAMP (cp 34 at 4300) | a drop, RAIL SAWS (along the trough's edge at him: jump), alone, then mixed with a wall saw and a swing; the bear shredded |
| 5420 | THE BREAK | the giant saw drops out of the sky and slams into the ground ahead (5720); a fault line cracks open, the flume over it breaks apart, the log falls through the chasm (5700-5840) into the sewer: a big splash |
| 5840 | THE SEWER (cp 35 at 5900, cp 36 at 7060) | LOW PIPES (a bundle of round pipes down from the vault to head height: duck), BUSTED PIPE sections across the channel (jump), SEWAGE GUSHERS (round outfalls: brake, paddle or hop), RATS on the walkways (they leap at the log); no saws |
| 8400 | THE CULVERT | out of the bluff the park sits on through its busted fence (PARK PROPERTY ENDS), down the spillway into a real river |
| 8640 | A REAL RIVER (cp 37 at 8700, cp 38 at 10080) | a big splash in; the crew's ROCKS! JUMP EM and LOW LIMBS DUCK! boards; ROCKS (well up out of the water, foaming, an orange blaze: be in the air as the log hits one), LOW LIMBS (a fallen real tree's crown down onto one great limb at head height, DUCK sprayed on it), crows; the rapids; a real waterfall (a big splash); the crew's WOODCHIPPER AHEAD sign |
| 10760 | THE SLUICE | the crew's conveyor up into the chipper: READY (amber), then JUMP! (green, flashing, the crew yelling it, ~110 frames): over the hopper onto the clearing; missed: mulched |
| 11180 | THE CREW'S CLEARING | the logging crew (2, chainsaws; throw one in the chipper); off its right end (11900) into the woods; off its left end the trail back to the park (the station: ride it again) |

### Section 5: the woods (woods/layout.ts; x from the section's start; flat ground at GY)

| x | Stretch (checkpoint) | What |
|---|---|---|
| 0 | THE TREELINE (cp 40) | in from the crew's clearing (the left end goes back onto it, past the chipper); a real NO TRESPASSING sign nailed to a real tree (buckshot holes); power lines along the trail; the park's back fence and the backs of its painted mountains far behind |
| 500 | THE TRAIL | litter; a fallen tree over the trail (jump it or stand on it); POISON IVY alone (the scout troop's LEAVES OF THREE, LET IT BE); a crow |
| 1080 | A REAL BEAR TRAP | alone, rusty, chained to a stump in the leaves, no sign (a glint) |
| 1230 | THE BOULDER | jump from it over a wider ivy patch; a second crow |
| 1600 | THE DIRT LOT (cp 41) | the kids' spot: four riders doing laps over the jumps in its back lane, a ramp, a burnt couch, a fire ring, DIRT RATS sprayed on a boulder; the refill (big health, big ammo); the LEAF PILE by the trail (1700) |
| 1900 | THE BOUNTY | the scene (woods/scene.ts), then the kid's bike into the chase (DOORS.dirtbike.start). After: the lot empty, the pile scattered, the kicked-off kid sulking on a stump (2080); off the right end on foot to the chase |

### Section 6: the dirt-bike chase (dirtbike/chase.ts WAVES; one stretch of generated road each, by time not x)

| Stretch (checkpoint) | Roadside sign | Teens (weapons, in order) | At once / working him | Road |
|---|---|---|---|---|
| THE DIRT TRAIL (cp 50) | DIRT TRAIL | bat, chain, bat | 1 (2 off the bounty) / 1 | woods, gentle bends and hills; logs across, dirt jumps; stumps |
| OPEN RANGE (cp 51) | OPEN RANGE | crowbar, chain, bat, crowbar | 2 / 1 | fields, fence posts, hay bales, cows (some in the road), rocks; a first-aid kit |
| FARM ROAD (cp 52) | FARM ROAD | nunchucks, bat, chain, nunchucks, crowbar | 3 / 2 | mailboxes, an outhouse, a parked tractor, SLOW CHILDREN, barns, cows in the road, hay; bigger hills |
| CREEK CROSSING (cp 53) | CREEK CROSSING | hockey stick, skateboard, chain, nunchucks, hockey stick | 3 / 2 | the creek fords (a CREEK sign, then water across the road: it bogs him down, or jump it), reeds, boulders, deer; sharper bends |
| POWER LINE CUT (cp 54) | POWER LINE CUT | skateboard, chain, hockey stick, crowbar, nunchucks, bat | 4 / 2 | the towers marching along both sides, logs, rocks in pairs, jumps, deer; steep hills, hard bends |
| THE LAST MILE (cp 55) | DEAD END 1 MILE | chain, skateboard, hockey stick, nunchucks, crowbar, bat, chain | 4 / 2 | dry fields, telephone poles, cows and deer crossing, logs, jumps; the hardest bends and hills |

30 teens in all; the wind-up (the tell) shortens 50 -> 34 frames down the stretches; teens take 3 punches early, 4
later (+1 if heavyset; was 2 / 3 before playtest fixes E). Tucker's glimpsed ahead each stretch (the bounty going up: TUCKER_RAISE, the ledger after).

### Section 7: the catch-up and Tucker's arena (arena/layout.ts; x from the section's start; flat ground at GY)

| x | Stretch (checkpoint) | What |
|---|---|---|
| 40 .. 720 | THE TRAIL (cp 60 at 200, manual: his once Tucker's up) | the catch-up (a cutscene in off the chase's black): Meathead on the kid's bike rides up on Tucker, whose bike has coughed out; the rant; Tucker guns it up the trail |
| 1230 | THE KID'S BIKE | where Meathead gets off after the crash (it stays there on its stand) |
| 1300 | THE REFILL | big health + big ammo (the boss-door refill; there every retry, short of the entrance beat) |
| 1400 .. 2000 | THE CLEARING | real woods thinned out round THE OAK (1700): its pointed branch at chest height; the crash, Tucker hung on it, the stolen bike wrecked under it; walk up to the body (~1490): the fake-out; Tucker up (~1550), NOW! ABOUT THAT FARE!, and (the same cutscene) off to the right |
| 2000 .. 2500 | THE AXE TREE (job F; the arena proper is job G's, about double size) | a tall pine (2130), a lumberjack's axe in its near side: Tucker taunts from just past it (2222), Meathead chops from 2080; the trunk comes down on Tucker's head (the split close-up), then lies along the ground (2144 .. 2404, its bare first 94 a low one-way ledge, lit top), the axe planted in the stump (scenery); Tucker blind at 2192 (a retry: flat there, the entrance beat 220 short); the fight's placeholder board (2424); walk past 2494: VICTORY, the walk-away |

## Standing rules (all apply)

- **Prototype first pass:** crude readable art (simple shapes, flat colors, recognizable silhouettes) but FULL game
  feel (final layout and flow, set pieces that work, obstacles, enemy placement, a difficulty curve, hit feedback,
  sound); peak-SNES later. **Tucker is the exception: full detail now.**
- **Fill in the unspecified; follow exactly where specific.**
- **Enemies:** all-new kinds (no M1 or other-land kinds); human enemies mixed (women too, skin tones, builds, hair;
  seeded variants). Each kind drawn right in every special death (its dead look, its head for the headshots). Lean drops.
- **Sub-bosses must die:** once active, both sides lock till it dies; open before; never respawned once past (the
  TEENAGERS).
- **Every M2 boss/sub-boss:** clean / shitty-pants / naked line pools for every line group, intro to death (Tucker's
  station lines included).
- **Dialogue:** blunt, short, vulgar, specific; talk less; fit the trigger; no line twice in 45 s (pickLine,
  speech.ts); speech text only while spoken; subtitles whole on screen (saidOver clamps); no talk-over (scripted lines
  finish before the next starts); cutscene skip is all-or-nothing; HUD hidden in cutscenes (inCutscene); HUD clear zone
  (topBand()). Never spell out that Meathead arrives by accident.
- **Any new way to hurt Meathead** gets voiced hurt lines + death lines (and its death screen); set-piece deaths get
  their own death messages.
- **Hazards and rides hurt enemies too;** enemies are never placed or idle in them (they can be knocked in).
- **M2 revisits differ;** destruction never locks the way back; checkpoints restore world state.
- **Fake 3D:** one shared eye per scene, straight walls, no depth layer over nearer things, cull by on-screen position.
- **Standable reads standable** (lit top lip; look-alikes dimmed); **impassable reads impassable.**
- **Signs:** readable (nothing over them), physically held up / diegetic, themed lettering (`kit.ts` frontierSign:
  the park's alphabet burned into planks), not the stock font.
- **No volcanoes** anywhere (snowcapped peaks only).
- **Drops and damage:** M2 lean drops, damage taken x0.65; main boss 666 HP, 60-frame breather, non-weakness 35%;
  sub-bosses no i-frames, big HP; a big health + ammo refill before the boss door (and before the sub-boss).
- **American English** (spelling, units: feet, miles, °F).
- **Time of day:** outdoor sections return `outdoors: () => 1` and draw drawTodSky (`kit.ts` frontierSky does).
- **Process:** no screenshots, no headless runs or sims (the user plays on the same PC); typecheck (`npx tsc
  --noEmit`); rebuild with `npm run release:m2`; voices with `npm run voices` (then `npm run voices:m2`).

## Decisions log

- 2026-10-17: the land's skeleton laid out (seven sections, 3000 gaps, checkpoints by tens), the hub portal opened, a
  crude walk-in (walkAway/intoFrontier.ts), the placeholder walk-away (walkAway/tucker.ts), the HUD skin ('frontier':
  a pine plank and a TICKET tag), voices wired (tools/voices, lines/consistency.ts OWN). The section-7 id is `arena` (a
  `tucker/` folder would clash with `tucker.ts`).
- 2026-10-17: the mining and logging town is SAWDUST GULCH.
- 2026-10-17: the walk-back from the parking lot (and the ticket lady's re-entry exchange) is recorded, not wired: a
  later job.
- 2026-10-17 (section 1): the rolling logs' rules: his left/right go into the log (it answers fast, tops out at 3.2 px
  a frame on top of the current) unless it's jammed against something that way, when they walk him along it (onto a
  bank, to its end for a jump). Idle logs drift with the current and wait at the downstream bank (the long river's at
  the log boom), so every crossing can be ridden back. Falling in is a swim (the river's pull at the boom, and the drop
  past it, are the falls: dead). Meathead's pose on one: Player.logRoll (feet pedaling, the free arm out, the wobble).
- 2026-10-17 (section 1): the station is LONESOME PINE STATION; the train waits behind the platform (engine front at
  wilds x ~20594, the caboose's back at 19900); Tucker's gate at 19760. A death after the pitch skips it (the pitch is
  remembered: straight to Tucker in the gate). The scene done is STATION_MEMO (stageMemo).
- 2026-10-17 (section 1): Tucker's station lines are in clean / shitty / naked pools (wilds/lines.ts); the user's line
  ("NO ONE BOARDS MY TRAIN WITHOUT A TICKET!") is verbatim in all three (the shat and naked ones add a kicker).
- 2026-10-18 (job 2, the train): the train stands still in the world and the world goes by it (scenery, ties, and
  whatever's coming, all scrolled by the train's distance). The cars' floors meet over the couplings (no falling between
  coupled cars); down on the ties while it's moving is death under the wheels (m2:fr_tracks). Cars he goes into:
  caboose, coach, dining car, baggage/mail car, cattle car (seen from outside with lit windows till he's in one, then
  opened up, the scenery through its windows); cars he crosses on top: boxcar, flatcar of logs, ore hopper, tank car
  (SARSAPARILLA), the tender.
- 2026-10-18 (job 2): THE CUT (the user's uncoupling): four marked cars; a way along one, the tell (Tucker on the
  speaking tube, the coupling ahead sparking and clanking, a flashing red ! and UNCOUPLING!, the car shuddering; 80-120
  frames, shorter toward the front), then that car and everything behind it drop back, faster and faster; ~560 px back
  it derails off the line (wrecks tumbling); still on it: dead (m2:fr_derail: flung off with it, its own death screens).
  On respawn the train's as it was at the checkpoint: cars cut loose before it stay gone, one cut after it is back on.
  Left too long at the engine (35 s), Tucker cuts the tender loose too.
- 2026-10-18 (job 2): fill-ins (ours, not the user's): the train's hazards are LOW BRIDGES (duck on a roof; inside or
  on a deck is safe), WATER TOWERS (the spout pours over the train: up on top of anything it hoses him back; get
  inside), the fireman's COAL (lobbed, rolls back along the roofs: jump it), the stack's CINDERS over the last cars
  (a glowing mark where each lands); each warned of at the right edge first, and each hits the cast too (bridges take
  brakemen off roofs and robbers off horses; the tunnel portals scrape riders off). The cast (all new kinds, `m2:fr_*`,
  people seeded on Spooky Land's costume drawer): porter (suitcases), brakeman (brake club, on roofs), robber (rides up
  along the embankment behind the train and shoots at the roofs (inside is cover), then leaps aboard), cook (cleavers,
  a frying pan), passenger (a lady's parasol or a gent's cane: pointy), longhorn steer (cattle cars; pointy), fireman
  (on the tender's coal). Tunnels darken by the lighting system (0.72 at most, the cars' lanterns, the tunnel's wall
  lamps and the headlamp lighting it), longer and closer together toward the front.
- 2026-10-18 (job 2): the run for the caboose: from the station he's on the ties behind the train laboring up a grade
  (the world going by slow); he runs it down and hops onto the back porch (a cutscene, SKIP >> puts him on it); then the
  train gets up to speed. Off the back of the rearmost car (or the section's left end) is the way back to the station.
- 2026-10-18 (job 2): THE ENGINE: Tucker leans out of the back of the cab over the tender (the cab's walled off) under
  the flashing KILL arrow (Meathead 1's, as on Riggs: the same red arrow and lettering) and rants the ledger, line after
  line. Any hit on him is the shot (a stand-in in his window; shots into it count too). The eye close-up (engine.ts's
  wound painter, tucker.ts's close-up, mirrored to face the shot): the slug coming in, the lens starring, the eye
  bursting out the front, the gout out the back of his head, the hole clean through with the sky through it, the blood
  running, a wisp of smoke; his last words; he slumps head down over the sill onto the whistle cord (the whistle stuck
  on: Riggs's horn), nobody's driving, faster, into Sawdust Gulch's buffer stop: the crash, the flash, black, the town.
  TUCKER_EYE_MEMO ('frontier-tucker-eye') is set and stays for the land: tucker.ts now draws the eye wound on his figure
  (the socket, sky through it, the lens starred, the blood run, the exit hole); section.ts `tuckerWoundsOf(state)` gives
  later jobs his wounds (they set 'frontier-tucker-saw' / 'frontier-tucker-branch'). CRASH_MEMO ('frontier-train-crashed')
  marks the revisit: the train stood still at the end of the line, whole again, nobody on it, OUT OF SERVICE on the cab;
  into the cab's back goes on to the town; the town's left end comes back to the tender (DOORS.train.end, set by train/).
- 2026-10-18 (job 2): Tucker's speaking-tube lines (train/lines.ts: boarding, the ledger now and then, the cuts, made
  it anyway, the first tunnel, the robbers, the rant, time's up, his last words) are clean / shitty / naked pools; his
  words show up top by a brass horn while they're said.
- 2026-10-18 (job 3, the town; fill-ins, ours, not the user's): the user's words are only "a sequence of characters in
  this logging/mining town going through the town and the mines for a bit until you hit the log ride"; all the rest is
  ours. The cast (all new kinds, `m2:fr_*`, people seeded on Spooky Land's costume drawer; the park's staff in costume,
  breaking character to yell at him): deputy (six-shooter), sheriff (DRAW!: fans three shots), snake-oil salesman (DR.
  PEABODY'S MIRACLE TONIC: bottles burst into a choking cloud that hurts anybody), barbershop quartet (they sing SHAVE AND
  A HAIRCUT... as the tell, TWO BITS! on the slash; straight razors), bouncer (grab and throw), can-can dancers (men too;
  the kick, whiskey bottles), undertaker (measures him first: 6 FT 1, then the spade), blacksmith (red-hot horseshoes
  that skid and stay hot), farmhand (pitchfork: pointy), feller (chops a prop pine: TIMBER!, it falls the way it leans on
  whoever's there; hatchets after), birler (a lumberjack on his own log ramming Meathead's), miner (pickaxe; a lit
  candle on his hard hat: spiky, HOT WAX!), prospector (lit dynamite, lobbed), and TNT crates (fixtures that go up).
- 2026-10-18 (job 3): Tucker in the town: never seen alive. The visit of the crash, the engine's nosed into the smashed
  buffer stop steaming, guests gawk at the tape, and park EMTs carry a sheet-covered body (his cap on it, his shoes
  poking out, drips of blood) into FIRST AID. The undertaker's window: an empty coffin carded TUCKER. On a later visit the
  stop's rebuilt (REPAIRS BILLED TO: YOU KNOW WHO), no wreck, no gawkers.
- 2026-10-18 (job 3): the two set-piece fights shut their doors till they're done (the cast held off till he's in;
  the camera held on the room, everybody on screen): THE SALOON's brawl (the doors barred, the upstairs window shuttered;
  two waves, the next when the last is down to one) and THE SHOWDOWN (the Wild West Show's street, "WILD WEST SHOW 2PM"
  on main street: gates SHOW IN PROGRESS, guests in the bleachers, the announcer, the sheriff's line; cover that stops
  shots). A checkpoint past either has it done. No line names the time of day (the show's sign is a schedule).
- 2026-10-18 (job 3): the land's ROLLING LOGS again on the mill pond, escalated: the BIRLER (his log driven at
  Meathead's; a hard ram bucks him up off it and hurts) and the JACK LADDER (a log that reaches pond B's right end is
  hauled up the chain with whoever's on it and tipped onto the mill deck: the only way up; a new log floats out at home
  later). Back the other way: off the deck's left end, swim the pond.
- 2026-10-18 (job 3): the sawmill's saw kept modest (one head saw, the buzzsaw spectacle is the log ride's): belt one
  carries him and its logs right into it, belt two runs back at him with logs that shove him (jump them or ride them).
  The mine: dark by the lighting system (0.64 at most, lanterns, the blasts light it), cave-ins (dust and a creak, then
  rocks; the rubble clears), an ore chute, runaway carts (warned by a lamp at the edge; they come out of a side adit,
  hurt the cast, set off a TNT crate in their way), the ride cart over the trestle (it comes to whichever end he's at),
  LOW BEAMS over it (duck), the canary (singing at the top, dead at the gas), FIREDAMP (a shot fired in it, or a blast
  reaching it, sets the whole pocket off; it builds back), the flooded shaft (swim under the rock). New hurts, each with
  its lines and death screens: the cast's, the tonic, bottles, horseshoes, hatchets, TIMBER, the birler's ram, hot wax,
  dynamite, cave-in, ore, mine cart, beam, firedamp, the mill saw.
- 2026-10-18 (job 4, the log ride; the user's: the booth, the saw into his forehead and its animated close-up, the
  saws along a tracked ride, the sewer, the real river, the woodchipper's jump. Everything below is OURS unless it
  says the user's): the section widened to FRX+64600 (a ride counted by time: ~11000 px of flume at 1.4-3.6 px a frame,
  the drops faster; about a minute and a half with the scene). One flume left to right (logride/layout.ts TRACK),
  stacked down in y: the ride at the park's level, the sewer under it (GY+560), the real river in the valley under the
  park's bluff (GY+900, then GY+1080 past the waterfall).
- 2026-10-18 (job 4): RIDING THE LOG (ours): the log follows the flume at the ride's pace; LEFT drags his hands in the
  water (brake, x0.55), RIGHT paddles (x1.4), wherever the ride isn't on the chain or down a drop; JUMP hops him up out
  of the log and back down into it (kept over the log); DOWN ducks him low in it; he can shoot; no specials (they need
  ground). No hopping out onto ledges: the saws are the game. Respawns at 31-38 put him straight back in a log there
  (index.ts boards him the first frame after the rebuild); the station (30) is walked to.
- 2026-10-18 (job 4): the saws (ours, from the user's "buzzsaw obstacles"): WALL (a hazard-striped bulkhead down to
  head height: duck), RISING (the water boils, it comes up knee high as the log nears: jump), DROPPING (out of rafters
  on a beat, a shudder and a red lamp first: brake or paddle through the gap), SWINGING (pendulum under a gantry: duck as
  it comes through), RAIL (runs along the trough's edge at him: jump), and in the sewer ROLLING (loose, down the tunnel:
  jump). Each alone and safe first, then two, then mixed. A saw shot 3-4 times JAMS (smokes, stops). The animatronic
  frontier (a settler, the beavers, lumberjacks, a bear) is sawed in half as the log comes by. The ride's recorded
  spiel on the PA (the announcer's voice) chirps along regardless. The BREAK: a giant cutter comes down across the
  flume ahead of him; the log jumps the cut and drops through a storm grate into the sewer.
- 2026-10-18 (job 4): THE BOOTH (the user's beats; the staging ours): the operator (people.ts, a man or a woman by the
  visit; two new voices, `m2.frontier.operator` / `operatorf`) barks as he cuts; he drops into the waiting log; Tucker
  bursts in the booth's back door, shoves the operator out onto the platform, "TIME TO ENGAGE THE BUZZSAWS!" (verbatim
  in all three pools), slams the big red button (the klaxon, every saw on the line spinning up), and EFFECT #1, hung over
  the console, drops on its arm into his forehead. The close-up (scene.ts's painter): the blade down out of the dark,
  the bite through his cap (split in two, the brass plate flying), the grind down into his forehead (sparks, bone chips,
  a blood spray, the slot with bone at its lips), stuck there spinning down and smoking, the blood down his brow and
  over his spectacles into the empty socket, his one eye dazed; his last words (SPLITTING HEADACHE). Flat on the booth's
  floor, the saw still in him; Meathead's line; the operator up (KEEP YOUR ARMS INSIDE THE LOG); away. TUCKER_SAW_MEMO
  ('frontier-tucker-saw') is set: tucker.ts draws the saw (stopped, a tooth gone, blood on its teeth, the slot through
  the cap, the blood run) on him from here on. New Tucker poses for it: 'shove', 'slam', 'press'. Back in a log later
  (a death, another visit): no scene, the operator's OP_AGAIN; this visit his body's still on the booth's floor,
  another visit a chalk outline.
- 2026-10-18 (job 4): the sewer (ours past "gross, dark"): brick, sludge (see-through over the log), lit by the
  lighting system (0.62 at most; daylight down through storm grates, caged bulbs, a little light round him); rats on
  the walkways (`m2:fr_rat`: sit up sniffing, the hunker and squeak, the leap; a bite, then off into the sludge to drown;
  saws and gushers kill them).
- 2026-10-18 (job 4): the real river (ours past the user's "real river"): out of a culvert in the bluff the park sits on,
  its chain-link busted, the park's last sign on the headwall (PARK PROPERTY ENDS / NOT RESPONSIBLE PAST HERE); real
  rock, real pines, no bolts; ROCKS (the log bucks: in the air as it hits, or his spine), LOW BRANCHES (a fallen tree's
  crown: duck), crows (the wilds' kind), a real waterfall.
- 2026-10-18 (job 4): THE WOODCHIPPER (the user's: jump out at that moment or a funny death): a logging crew's (real
  loggers, past the park): their hand-painted WOODCHIPPER AHEAD sign, their conveyor hauling the log up into the
  hopper of their CHIP-O-MATIC 9000. Telegraphed: the lamp on it goes amber (READY...), then flashes green with a big
  JUMP! and a dotted arc to the landing, the crew yelling it (about 110 frames to do it in; a jump before that is just a
  hop). Jumped: he vaults over the hopper onto the crew's clearing (his line); the log goes through, chips over their
  truck. Missed: the log noses in, then him feet first, flailing (his hurt line), the chute spraying chips, then red,
  his shoe, the bits of his pants, over the truck; the death screen (m2:fr_chipper). The clearing: off its right end into
  the woods (DOORS.woods.start); back from the woods onto it (DOORS.logride.end); off its left end the TRAIL TO PARK
  (the station: the ride again, saws still on). Revisits differ: the chipper off and the crew idle, the booth's chalk
  outline, the operator out on the platform.
- 2026-10-18 (job 4): new hurts, each with its hurt and death lines: m2:fr_saw, m2:fr_rat, m2:fr_pipe, m2:fr_sewage,
  m2:fr_rock, m2:fr_chipper (the branches reuse the wilds' m2:fr_branch). Meathead loves rides (I LOVE LOG RIDES; the
  lift hill's click click; BEST! RIDE! EVER!); his, Tucker's, the operator's and the crew's lines in clean / shitty /
  naked pools.
- 2026-10-18 (job 5, the woods and the bounty; the user's: real woods outside the park, kids on dirt bikes, the kick
  and "MINE", Tucker EXTRA BLOODIED out of a leaf pile, knocking a rider off and hijacking his bike, his apology, "20
  BUCKS FOR THE FIRST ONE TO GIVE ME THAT MEATHEAD'S HEAD", the teens happily obliging, dozens of them. Everything below
  is OURS unless it says the user's): the section kept at its 3000 (a short walk, most of it the scene). The walk: a real
  NO TRESPASSING sign on a real tree, power lines (sneakers slung over a span), litter, the park's back fence glimpsed
  far behind (and over it the BACKS of its painted mountains: raw plywood, 2x4 bracing, PROP 7 stenciled; the log ride's
  lift hill); real-world lettering only (painted, stenciled, sprayed). Two light hazards: POISON IVY (taught alone with a
  scout troop's LEAVES OF THREE, LET IT BE; walking through hurts a little every so often and he itches a few ticks
  after; jump it; m2:fr_ivy, new, its hurt lines and death screens) and A REAL BEAR TRAP (rusty, chained to a stump in
  the leaves, no sign; the wilds' rules and their m2:fr_beartrap lines). Two crows (the wilds' kind). The refill (big
  health + big ammo) on the lot before the bounty, for the TEENAGERS after it.
- 2026-10-18 (job 5): THE KICK IS A SCENE, not played (ours): one cutscene from the kid pulling up to the ride off (no
  HUD, SKIP >> for all of it), because the kick has to land on one particular kid and flows straight into Tucker's
  jumpscare and the offer; a played kick would need killable-but-not-killable kids and a way to dawdle out of it. The
  beats: walking into the lot (x 1900) a kid rides up beside him, idling, and says something about the state of him
  (KID_HI); the kick (his cutscene kick pose), the kid off it flat in the dirt; "MINE." (the user's, all three pools);
  he gets on (Meathead's seated pose, Player.jetski/moto set only for the scene; the bike drawn under him); the kid from
  the dirt (KID_DOWN); a beat: the leaf pile he walked right past shivers, twice.
- 2026-10-18 (job 5): THE LEAF PILE (the user's pop-up; the staging ours): the sting (slam, crash, a high alarm, the
  kids screaming, a roar), a big shake, leaves everywhere, and the screen SNAPS to Tucker's screaming face (white frame,
  red frame, his close-up full screen with leaves whipping across) while he screams (TUCKER_POP: AAAHHH!, the shat and
  naked ones a word more); back out, Meathead twisted round on the bike to look. No new mutilation here, so no
  mutilation close-up. A second kid rides by along the trail: Tucker dives at him head first (new pose 'pounce'),
  knocks him off backwards into the leaves and lands on his bike (new poses 'ride', 'ridepoint'; 'pop' for the burst).
  His apology to the kid (TUCKER_SORRY: cheery, polite, a receipt); the lot's four riders pull up behind; THE OFFER
  (the user's line verbatim in all three, the shat and naked ones add a kicker: WEAR GLOVES / THE ONE ON HIS
  SHOULDERS); a kid: TWENTY BUCKS?! HELL YEAH! (TEENS_YES), the lot revving (wheelies), and 22 more riders pour out of
  the trees from both sides into the lot's two back lanes (one shared eye: further lanes smaller); Meathead's say
  (BOUNTY_BACK: TWENTY BUCKS? MY HEAD'S WORTH WAY MORE THAN THAT); he guns it off right, front wheel up, Tucker and the
  lot after him; black; DOORS.dirtbike.start (on foot there for now: job 6's stub; `takeBountyHandoff()` in
  woods/scene.ts is true once after the ride off, for job 6 to start him on the bike).
- 2026-10-18 (job 5): EXTRA BLOODIED (the user's; the look ours): tucker.ts `TuckerWounds.grime`, GRIME_MEMO
  ('frontier-tucker-grime', set at the leaf pile, and by a skip) and section.ts `tuckerWoundsOf(state).grime`: fresh
  blood down his shirt front and splashed over a lapel and his cheek, the sewer's muck up his coat's hems and across his
  belly and forehead, the chipper's wood chips stuck all over him and in his chops, the near shoulder torn open, leaves
  off the pile on his cap, in a chop and his collar; on the close-up too. On him for the rest of the land (with the eye
  and the saw: the scene sets those memos too, so a checkpoint-skip start sees him right). Never explained.
- 2026-10-18 (job 5): the kids (ours past the user's "teenagers"): real local teens (woods/teens.ts), people.ts's
  drawer kept young (no beards, no bald heads), boys and girls, every skin and build, helmets (motocross: a peak, a
  chin bar, goggles up) or not, all seeded; crude dirt bikes (knobby tires, high fenders, a number plate, a color
  each). Four new voices (cast.json: m2.frontier.teen, teen2, teenf, teenf2; TEEN_VOICES in woods/lines.ts for job 6).
  Their lines react to the state of him (clean / shitty / naked), as do Tucker's and Meathead's.
- 2026-10-18 (job 5): revisits (ours): BOUNTY_MEMO ('frontier-woods-bounty') keeps it done (respawns, a checkpoint skip
  past it, or walking back in from the chase's end). The lot's empty (the kids off chasing him), the leaf pile
  scattered, and the kid he kicked off sulking on a stump by the trail (KID_SULK, by the state of him, each time he comes
  back by). The way on after the bounty: off the right end on foot to the chase's start; the way back: the left end
  onto the crew's clearing past the chipper (DOORS.logride.end).
- 2026-10-18 (job 6, the dirt-bike chase: the TEENAGERS sub-boss. The user's: Road Rash on the Genesis, not Mode 7; X /
  left click attacks left, B / right click attacks right, A jumps; trees, cows and wildlife by the roadside to bail into
  (heavy damage, a quick respawn, only deadly low); the teens' weapons; PUNCH PARRIES instead of stealing them, the bike
  chain's (grab it, swing the teen over his head, toss them forward: a little human bomb ahead of him); a sub-boss
  called TEENAGERS. Everything below is OURS unless it says the user's): a self-contained mode that takes the screen
  over (as Foreign Lands' helicopter does): dirtbike/chase.ts, drawn from the section's drawHud over everything, his own
  figure hidden and held (Player.hidden/carried) while it runs; the React HUD swaps to the bike's (store.ts
  bikeHud/bikeBoost: the PWR row the boost, FISTS for the weapon) and a controls card at the start (bikeTips, the real
  button icons via Prompt).
- 2026-10-18 (job 6): THE ROAD (the user's "the visual effects genesis games would use"; the build ours): Lou's
  segment road (road.ts): 200-unit segments, bends as an accumulated per-segment x offset, hills as per-segment heights,
  drawn far to near as flat bands (grass, the dirt's rumble edge, the road, two worn ruts) alternating light/dark every 3
  segments, fogged toward the horizon in 6 bands (the time of day's haze); roadside sprites painted once each onto little
  canvases and drawn scaled, cropped at any crest in front of them; parallax (the snowcapped range, a pine line or soft
  hills with a barn, the power line towers) sliding on the bends; the sky by the hour; all on a 400x300 canvas blown up
  2x (crisp pixels, banded), the hour's light multiplied over it. The road is GENERATED as he rides into a ring of
  segments, by stretch (biome), seeded per stretch: a stretch lasts till its teens are beaten (the next one's road starts
  out past the horizon, its county sign first). Real-world lettering only (county signs, SLOW CHILDREN).
- 2026-10-18 (job 6): RIDING (ours): it rides itself at a cruise (~63 MPH on the speedo); UP boosts (~90 MPH: drains in
  2.5 s, back in 7 s, a parry tops it up a third), DOWN brakes; left/right steer, the bends push him outward (harder the
  faster); off the road is slower and bumpy. A jumps (over logs, rocks, the creek, a teen's swing); dirt jumps in the road
  launch him. Bails (the user's) on anything tall by or in the road: over the bars, tumbling, the bike cartwheeling,
  32 damage (x0.65: ~21 of 100), then back on the road in ~1.3 s, blinking 2 s (nothing bails him meanwhile). Cows and
  deer he (or a teen, or a blast) hits die bleeding (legs up, X eyes). A first-aid kit in the road once a stretch from the
  second on (+30).
- 2026-10-18 (job 6): THE TEENS (ours past the user's "teenagers use weapons"): woods/teens.ts's seeded kids (boys and
  girls, every skin, heavy or thin, helmets or hair, ponytails), drawn from behind on their bikes; weapons: bike chain,
  baseball bat, crowbar, nunchucks, hockey stick, skateboard. They spawn from behind (off-screen, overtaking) and ahead
  (hanging back); one or two at a time work him, one per side, the rest hover; a swing is a wind-up (weapon up behind
  them; the last 18 frames it flashes white with a "!" over them: THE TELL), then the swing (14 damage). A plain hit
  knocks them about (shoved outward: into the roadside if they're near it); 2-3 and they're off (tumbling, landing face
  down backside up, the underwear riding up; their bike skidding on loose: it hurts him if he hits it moving). Bumping
  shoves them more than him. Hazards hit them too (shoved or blinded into trees, cows; blasts).
- 2026-10-18 (job 6): THE PUNCH PARRIES (the user's rule and the chain's; the others: the bat, crowbar and nunchucks
  were proposed and liked; the hockey stick and skateboard ours): hit toward a teen's side during the tell or the swing
  (an 18 + 9 frame window): an instant elimination, a hit-stop, PARRY!, then the flourish (the camera stays on the road):
  CHAIN (the user's): he grabs the chain, yanks them off, whirls them round over his head and lets go: they sail ahead
  and go off as a small human bomb (a banded fireball, chunks), taking out any teen (and any cow) near it; riding into
  its blast hurts him (m2:fr_teenbomb). BAT: he catches it, BONK on their head, they flip over the bars and fly into a
  roadside tree far enough ahead to see it (it's left a tree with a kid folded round it, bleeding). CROWBAR: yanked
  away, they FACEPLANT in the road ahead; he rides over them (SPLAT) and their own pack's thumps follow. NUNCHUCKS: round
  their neck; slung back over his shoulder past the camera into the pack behind: everybody behind him goes down (STRIKE!
  / SPARE! / GUTTER BALL!). HOCKEY STICK (ours): jammed in their front spokes: the bike stops dead, they pole-vault over
  the bars and land face down ahead: a HUMAN RAMP (ride over it: big air). SKATEBOARD (ours): snatched and brought down
  over their head (NECK BOARD!): they ride on blind, wearing it, and drift into whatever's by the road (a cow put there
  if there's nothing): both dead.
- 2026-10-18 (job 6): THE SUB-BOSS (the user's: TEENAGERS): the bar in the top band (topBand()): every teen left,
  pooled (30), its title, the count. Once it's on there's no way out of it (the mode has no exits); never respawned once
  beaten (TEENS_MEMO 'frontier-teens-done'). Checkpoints (ours): one a stretch, 50-55 (manual, set as each stretch
  begins); dying puts him straight back on the bike at the stretch he's in, the stretches before it beaten, that
  stretch's teens all back. Off the bounty's ride (takeBountyHandoff) he's straight into it; walked in on foot, the kid's
  bike is parked on the side view's trail (walk onto it). The refill was the woods' lot.
- 2026-10-18 (job 6): TUCKER (ours past "glimpsed, out of reach"): each stretch he rides up out of the distance ahead on
  the stolen bike, never nearer than ~1700, twisted round in his seat to yell back (tucker.ts's close-up as his face, small,
  his wounds and grime on), the bounty going up each time (TUCKER_RAISE: FORTY BUCKS!...), sometimes the ledger; then off
  over the horizon. While he yells, a Genesis-style talking head of him at full detail (the close-up) sits under the bar.
- 2026-10-18 (job 6): THE END (ours, short of job 7's catch-up): the last teen down, a cutscene (no HUD, SKIP >> for all
  of it): Tucker ahead, MY BOUNTY! (TUCKER_FLEE), swerves off the road into the trees; Meathead: HEY, BUZZSAW! WHERE'S MY
  TWENTY BUCKS? (MH_END); black; DOORS.arena.start, takeChaseHandoff() true once (he came on the bike: job 7's to use).
  Afterward the side view's trail is walkable both ways (the woods behind, the arena ahead), a few wrecked bikes in it.
- 2026-10-18 (job 6): new hurts, each with hurt lines and death screens: the bails by what he hit (m2:fr_bail_tree,
  _post (posts, mailboxes, signs), _cow, _deer, _hay, _outhouse, _tractor, _rock, _log, _creek, _pylon), the weapons
  (m2:fr_chain, _bat, _crowbar, _nunchucks, _hockey, _skateboard), a loose bike (m2:fr_bikewreck), his own human bomb
  (m2:fr_teenbomb). Lines (clean / shitty / naked): his start, back on after dying, knock-off quips, a pool per parry,
  the end; the teens' taunts and parried yelps (reacting to the state of him); Tucker's raises, ledger and flee. Tuned
  blind (no runs): speeds, the parry window, wave sizes, damage.
- 2026-10-18 (job 7, the catch-up, the impalement and the fake-out. The user's: back to side view, Meathead catches up,
  "YOU TOOK THEM ALL OUT?", furious, the line-cutter and "I DON'T GIVE HANDOUTS", the crash into a tree with a pointy
  branch through his chest shown in detail (the close-up rule), the body, "ARE YOU GOING TO FAKE ME OUT AGAIN?", the
  jumpscare, the fight starting there. Everything below is OURS unless it says the user's): THE CATCH-UP is one
  cutscene (no HUD, SKIP >> for all of it), up out of the chase's black (takeChaseHandoff; walked in with it not done,
  the same): Meathead on the kid's bike up a real dirt trail; Tucker ahead on the stolen bike, coughing, run dry, rolling
  to a stop; Meathead pulls up behind him. Tucker hops off and turns: TUCKER_CAUGHT (the user's line verbatim in all
  three, a kicker on the shat and naked ones); furious (red, stamping): TUCKER_RANT (everybody waits, everybody pays,
  you rode it all free); Meathead's say (MH_CAUGHT: he wants his twenty bucks); TUCKER_HANDOUT ("I DON'T GIVE
  HANDOUTS" in every line). Then (ours, to get him onto the branch) he hops back on and revs, yelling he's running him
  over, "ON THE HOUSE" (the handout joke), and guns it off up the trail for a run at him, never looking where he's
  going, chest first onto the giant oak's pointed branch.
- 2026-10-18 (job 7): THE CLOSE-UP (the mutilation rule; catchup.ts's 'branch' painter on tucker.ts's close-up, framed
  to show his chest): the branch coming at him (speed streaks), the point punching into his vest (his TUCKER badge and
  two vest buttons popping off), on through him and bursting out behind his far shoulder (blood, coat, a chip of rib,
  a red mist), him shoved on up it to the thick of it, the blood pumping out of the hole a beat at a time, coughed out
  of his mouth and running off his chin, dripping off the point; the oak's leaves shaken down (one settles on his cap);
  his face manic, shocked, hurt, out; his last words (TUCKER_SKEWERED: PUT IT... ON MY TAB...). Wide: hung on the branch
  by his chest, limp (new pose 'impaled': tipped forward over it, arms and legs dangling, head lolled; tucker.ts
  IMPALED_TILT / tuckerPoint line the oak's branch up with his chest), the stolen bike nosed into the oak and wrecked
  under him, its back wheel turning, smoking. Meathead rides up under him (MH_SKEWERED: SHISH KEBAB) and gets off; the
  kid's bike stays parked there for good.
- 2026-10-18 (job 7): THE BRANCH WOUND (tucker.ts `branch`, BRANCH_MEMO 'frontier-tucker-branch'; on him from here on,
  through his fight): in at the front of his chest (the vest torn open in a ragged star, the blood pumped down his front
  to the belt), out his back (the coat torn, the point red and dripping), snapped off a hand's width in front of him (raw
  splintered wood, a twig with turning leaves still on it), the blood he's coughed up off his chin; on the close-up too
  (drawCloseupBranch). `onBranch` (TuckerOpts) leaves the broken end off while he's still on the oak. drawBough is the
  shared branch painter.
- 2026-10-18 (job 7): THE FAKE-OUT (the user's beats; the staging ours) is played up to the body (Meathead walks up
  himself, past the refill), then a cutscene (no HUD, SKIP >> for all of it): FAKE_ME_OUT (the user's line verbatim in
  all three, a kicker on the shat and naked ones); a beat (a leaf comes down, he leans in); YEP: the branch snaps off
  the oak (he takes it with him) and he comes off it at Meathead screaming: the jumpscare as the leaf pile's (a sting, a
  big shake, the screen snapped to his screaming face with every wound on it, the branch at the bottom of the frame,
  the oak's leaves whipping across; TUCKER_JUMP), Meathead jumping back out of his skin (MH_JUMPED: EVERY. SINGLE.
  TIME.); Tucker on his feet with the branch through him, squaring up: TUCKER_UP (NOW! ABOUT THAT FARE!). UP_MEMO
  ('frontier-arena-up'), checkpoint 60. intro.ts is written to be the fight's intro (`onUp` is where the fight starts).
- 2026-10-18 (job 7): A RETRY (checkpoint 60, the same visit): no fake-out; THE ENTRANCE BEAT (as the other land
  bosses' retries): he's lying flat by the oak, the branch up out of his chest; walk up and he pops up again (a sting, a
  shake, TUCKER_ENTRANCE: STILL HERE!), Meathead free meanwhile; then it's on. A fresh visit (or the checkpoint skip to
  60) gets the whole fake-out again, him hung on the oak. Checkpoint 60 (and anything past the catch-up) restores the
  world as a run left it: the catch-up done, his memos set, the bikes where they were left.
- 2026-10-18 (job 7): THE FIGHT'S PLACEHOLDER (the fight isn't designed: not invented): Tucker stands there squaring up
  (stamping, jabbing his ledger finger, every wound on), a hand-painted plywood board past the oak (TUCKER / THE FIGHT:
  COMING SOON); walk on past him and the oak: VICTORY, the walk-away (FLINTLOCK), the hub, the land cleared. The boss
  door's refill (big health + big ammo) is the arena's own, between the kid's bike and the body (the woods' was before
  the TEENAGERS, too far back). Revisits once the land's cleared: nobody; the oak's branch snapped, the wreck, the kid's
  bike.
- 2026-10-18 (job F, TUCKER'S ARENA ENTRY. The user's: "after getting impaled by the tree branch, he runs off to the
  right, taunting you to fight him, man to man. there's a tree with a lumberjack axe sticking in it. with one swing,
  meathead chops down the tree and it falls on his head, pushing the buzzsaw in his forehead further down splitting his
  face up to his nose in half now. then the fight begins. be sure to show a closeup of this happening." Everything below
  is OURS unless it says the user's): arena/entry.ts, straight on from the fake-out's NOW! ABOUT THAT FARE! as THE SAME
  CUTSCENE (no HUD, no controls; SKIP >> anywhere in the fake-out or the entry lands on the fight's start: the tree down,
  the axe in the stump, him split and blind at his spot, Meathead by the stump). Tucker runs off right past the oak to
  the AXE TREE (a tall crude pine, the axe stuck in its near side at cutting height, old chop marks) and turns round just
  past it (the side it'll fall): TUCKER_TAUNT (MAN TO MAN, ledger talk). Meathead walks himself up to the tree (MH_AXE),
  yanks the axe out, hoists it over his shoulder and with ONE swing goes clean through (Player.axeSwing, a new Meathead
  pose: render/player/moves.ts drawAxeSwing, AXE_BITE; both hands, the in-game sprite just mirrors, the left-handed
  rule's way; a red-headed axe, the bit leading). The trunk creaks over about its butt, faster and faster, Tucker still
  gloating, then looking up, onto his head (TH_HIT: its underside on the saw's back).
- 2026-10-18 (job F): THE CLOSE-UP (the mutilation rule; entry.ts's 'split' painter on tucker.ts's close-up, framed on
  his face): the trunk's shadow and the speed of it coming down; the slam onto the saw's back (a white flash, an impact
  star, bark chips and needles); the saw driven down through his skull to the top of his nose while his head itself is
  drawn splitting as it goes (registerWoundPainter's new `drive`: the head gets the wound's 0..1); his face split in half
  up from the nose (the two halves shoved apart in a V, the cap with them), the skull's bone white and chipped at the
  lips, his brains bulging out at them, blood and bone and brains bursting out both ways; the far eye bursting out of its
  socket on its snapped nerve, spinning off, the far half of his spectacles with it, both sockets spurting (a red flash);
  the trunk bounced off him and gone; the blood fountaining up out of the V a beat at a time; his scream (TUCKER_SPLIT).
  Behind the close-up the trunk slides off the stump to the ground and lands (a crash, dust and needles) and Meathead
  plants THE AXE IN THE STUMP: it stays there as scenery (the visit and the revisits), not a weapon pickup. Wide: he
  staggers out from under it, groping (new Tucker pose 'grope': both hands out feeling the air, a shuffle, chin up), "I
  CAN'T SEE!" (TUCKER_BLIND), Meathead's say (MH_BLIND), "...DOESN'T MATTER!" squared up the wrong way (TUCKER_MATTER);
  the fight starts there (`onUp`; still the placeholder: he gropes and jabs his finger, sometimes the wrong way; walk
  past the felled tree: VICTORY). Checkpoint 60 is now set at the entry's end.
- 2026-10-18 (job F): THE SPLIT WOUND (tucker.ts `split`, SPLIT_MEMO 'frontier-tucker-split', in tuckerWoundsOf; on him
  from here on, figure and close-up, stacked with the eye, the branch and the grime; the saw's now the split's):
  drawHead draws the head three times, below the top of his nose as he is and each half above it sheared out away from
  the cut (a V widening up through the cap), then the gap over it (meat, bone lips, brains, the saw's hub down between
  his eyes, its blade seen in the gap and out in front of his brow, its snapped hanger up out of the top), blood sheeting
  down both halves and off his nose, both eye sockets empty and bleeding, the spectacles snapped at the bridge (the near
  lens hung crooked, starred), blood down his collar and shirt. A number is how far it's driven (the close-up's frames).
  BLIND from here on: job G's fight is fought blind (the user's: the blow severed his optic nerves; a flintlock).
- 2026-10-18 (job F): A RETRY (checkpoint 60, the same visit): the axe tree down, the axe in the stump, him lying flat by
  the felled trunk, split (TUCKER_ENTRANCE now blind: WHERE'D YOU GO?! / I CAN SMELL YOU!), popping up when Meathead's
  220 short; a fresh visit or the cheat skip to 60 gets the oak, the fake-out and the entry again. Revisits once the
  land's cleared: the felled tree and the axe in the stump with the rest. The felled trunk's bare part is a low one-way
  ledge (lit top: standable reads standable); the boughs aren't solid. Job G re-lays the arena (double size): move the
  axe tree / felled trunk with it (layout.ts AXE_TREE_X, LOG_X, FIGHT_X).
- 2026-10-18 (job 7): still a SEPARATE LATER JOB, not built: the walk-back from the parking lot after his kill (the
  walk-away's HEADING BACK TO PARK, the intro's lot in a re-entry mode, the ticket lady's re-entry exchange, clean /
  shitty / naked; see the fill-ins above). And his fight itself, when the user gives it.
- 2026-10-18 (playtest fixes A, section 1, the user's notes): THE ANIMALS ARE BIGGER and tougher (drawn and boxed at
  a scale each, their heads, corpses and special deaths with them: doe x1.4, buck x1.35, wolf x1.4, cougar x1.3, bison
  x1.3, beaver x1.25, porcupine x1.25, rattler, crow and trout x1.2): doe 55 HP (kick 14), buck 120 (charge 22), wolf
  50 (bite 14), cougar 120 (pounce 20), bison 340 (charge 28). The deer, wolves, cougar and bison are NOT critters
  (mass over the hazards' small line: a trap or the bees no longer kill them outright; the slide's one-shot stays the
  rattler's and the porcupine's); the grabs beat them down, a dive kick or uppercut is the big hit. The bear traps are
  drawn and catch x1.45.
- 2026-10-18 (playtest A): any walking animal on a loose ledge cracks it like him. A doe bolting into a wall (a drop,
  the water's edge) wheels round, stamps (the tell) and RAMS him (m2:fr_doe_ram, its own hurt lines and death screens).
  The porcupine, him close, bristles (the tell: its quills rattling) and SPRAYS a fan of quills up off its back
  (m2:fr_needles): they go up and out over anything low, so the slide's the answer (the hazards that a low move gets
  under go by `reachTop`: the engine's box doesn't shrink); still no dive kicking it (spiky).
- 2026-10-18 (playtest A): THE LOG CROSSINGS: the pond stays the teach. Every later log (creek, rapids, river) waits
  TIED UP at the near (left) bank (a rope to a stake) till he's on it, or he comes at it from the far side (then it
  drifts down to him): the current had them off at the far bank before he got there. The water's a bad idea now: the
  park's stocked TROUT (aggressive, new kind m2:fr_trout: piranha-like at a swimmer; at him on a log, its fin shows (the
  tell) and it LEAPS out across at head height: duck under it or shoot it), taught alone in the creek's first pool (its
  sign: TROUT BITE. RIDE THE LOG.), then in every crossing; and SNAGS (sharpened deadwood just under the surface of the
  rapids and the river, their points poking out: a swimmer carried into one is cut, m2:fr_snag; the log rides over
  them; the rapids' sign: SNAGS. DO NOT SWIM.). The obstacles on the crossings: the leaping trout, the fallen trees (a
  new first one alone in the creek's second pool), the rocks, crows, beavers. (The trout's bite at a swimmer and the
  snags superseded by the leeches, job A2, below.)
- 2026-10-18 (playtest A): THE FALLEN TREES to duck on the log: the crown a wall of boughs down onto one great low limb
  flat across the water at ducking height (54 px over his feet, his ducked head clear under it), its underside scraped
  pale, a yellow DUCK! board with a red down arrow nailed to it; the limb is what hits (as wide as it's drawn). His own
  poses crouched on a log (render/player/player.ts logCrouch): squatting low, hunched forward with the wobble, the free
  hand down gripping the log in front, the boots shuffling round its top as he drives it on from the crouch.
- 2026-10-18 (playtest A): the rolling logs off the pile lie along the hill's slope (their belly on it) and visibly
  turn (bark streaks rolling round, a crack turning in each end; drawLog's for every log). The ravine's back wall runs
  rim to rim (nothing hangs over the lower side). The beehive: shot, smashed or thrown, its swarm's out; nothing kills
  the swarm; it stings mildly (3); after ~10 s it loses interest and drifts off up out of it.
- 2026-10-18 (playtest A): KILL CALLOUTS BY KIND: an engine-wide hook (dialogue.ts KIND_CALLOUTS, effects.ts
  spawnKillCallout; m2/kinds.ts registerKindCallouts): a kind's own pool per callout, in place of the engine's. Every
  wilds animal has its own for the swim kill (the one that was FISH STICKS! on a beaver); voiced as the announcer
  (wilds/lines.ts KILL_CALLS).
- 2026-10-18 (playtest A): CUTSCENES TAKE EVERY CONTROL: frontier/index.ts, for every section of the land: in a
  cutscene nothing of his gets through (a section's own script can still walk or hop him; never a shot or a special).
  The station: the pitch starts 520 px short of the gate (Tucker still off the screen's edge), Meathead walked up short
  of him without his controls; Tucker isn't something to hit till the pitch is done (a retry this visit: just TICKET,
  PLEASE); from the punch landing on it's all one cutscene (no controls, no HUD, one SKIP >>), anything he'd fired
  cleared.
- 2026-10-18 (playtest fixes B, the train, the user's notes): THE CARS ARE BIG (the user: "a lot bigger... allow me
  to actually platform inside. ceiling is way too low"): 300 tall inside (DECK GY-64, the ceiling 300 over it, the
  roof 12 thick on that), 440-660 long (22 cars now, not 26: the section widened to FRX+38300, the engine's nose at
  x0+13912). Inside, things to climb, each with its lit top (layout.ts `fittings`): luggage racks in two tiers (coach),
  bunks, a desk and a shelf (caboose), tables, shelves, the kitchen counter (diner), stacked crates and shelves
  (baggage), hay bales and a hayloft (cattle). Steps (lit treads on grab irons) up the cars' ends to the roofs and the
  tall loads. Tunnels, bridges and towers scaled to match (the bridge's underside 48 over a roof, the portal's arch 80).
  The engine is the first pass's drawing blown up to the cars' size (people stay theirs); every wheel sits on the rail.
- 2026-10-18 (playtest B): THE CAMERA PULLED BACK (the user's "zoom this area out a little bit"): the train's world
  drawn at 0.8 about the screen's middle (train/view.ts ZOOM; the whole view is the screen for the rules, viewIsScreen,
  reset by frontier/index.ts on any other section); the HUD and the words stay full size in screen space.
- 2026-10-18 (playtest B): THE LIGHTS MUTED (the user: "shine too brightly and makes everything look like a
  spotlight"): in a tunnel it's murky (0.86 dark at most, never black), the actors keep only a little of themselves
  (rim 0.2), the tunnel's wall lamps, the cars' windows, the headlamp and the caboose's marker only dim warm glows; the
  only clear view is INSIDE the car he's in (lit right through by a soft fill), or waiting it out.
- 2026-10-18 (playtest B): GRADES (the user's "uphill and downhill more frequently as you progress"): hills as things
  coming by (a climb then a drop, or a dip then a climb; 0.03 rad early to 0.065 at the front, more and closer
  together), the view tilting with the line under the middle of the screen (worldTilt: the whole train on its rails,
  every car aligned, the horizon level; the park's scenery sinking as the line climbs); up a grade the train slows,
  down one it picks up. The physics stays level (the tilt's only the view).
- 2026-10-18 (playtest B): THE WATERFALLS (the user's "an extended waterfall section where you need to find an indoor
  train and stay in there until it passes at a point or two"; the staging ours): the line runs under water pouring off
  the park's fake cliff. Outside under it (a roof, a load, a platform, a coupling) he's battered (pushed back, pressed
  down, hurt twice) and after ~0.9 s swept off the train (m2:fr_falls: its hurt lines, death lines, death screens);
  inside a car it goes over (the water down the windows). It sweeps the cast off too (SWEPT AWAY!). Telegraphed: a
  FALLS AHEAD / STAY IN YOUR CAR board up on posts over the roofs, the roar louder as it nears, the mist, the warning at
  the edge (WATERFALL > GET INSIDE!, 240 frames ahead), and the first time Tucker on the tube and Meathead's line.
  Two: a short one at the dining car (the diner and a coach to duck into), then a long one over the open cars (the
  hopper between the mail car and the second diner).
- 2026-10-18 (playtest B): THE ROBBERS from the FOREGROUND (the user's): they gallop up on the near side of the line
  (one shared eye: nearer, so x1.25 and lower, drawn over the train), keep pace and shoot at him if he's outside, then
  leap up onto whatever car's beside them (a scripted arc, shrinking to their size as they land); riding and leaping
  they ignore collision and nothing in the world hurts or kills them. They only ride where there's a clearing: they
  don't ride up with a tunnel, bridge or waterfall in or coming into the lane, and board before one gets to them.
  Shootable from the decks and platforms (not from inside a car: walls).
- 2026-10-18 (playtest B): INSIDE IS INSIDE (the user's "enemies inside cars don't camp the doors and can only be
  killed when inside yourself and cannot be sniped from outside"): whoever's in a car he isn't in is out of the world
  (cars.ts updateRooms: stashed, back where they were as he comes in), so nothing outside reaches them and they reach
  nothing; nothing flies through a car's walls either way (a shot fired in a car dies leaving it, one fired outside dies
  getting in: his, theirs, the robbers'); the cast inside keep 70 px clear of the doors and don't path (no following
  him out).
- 2026-10-18 (playtest B): THE CUT CAR'S END (the user: "it will slow down....THEN EXPLODE FOR NO REASON!"): no
  explosion. Cut loose, it drops back, slowing; a switch comes out from under the train behind it, its target flips
  green to red with a clank as the cut end gets to it (the points thrown under it), and the cut end goes off the line
  there: the wheels jump the rails (sparks, ballast, planks), each car slews off down the near bank and rolls over onto
  its side, wheels up, and is left there going by with the ground. Still on it: thrown off with it (m2:fr_derail, as
  before). A checkpoint respawn doesn't set off everything that came before it again.
- 2026-10-18 (playtest B): TUCKER AT THE ENGINE (the user's: "show a cutscene of tucker insulting you when you get
  close. he 'evades' if you use a special weapon, so you need to use the raygun. make sure you see the insult scene
  first before you can shoot him through the eye"): up onto the tender's back end, a cutscene (no controls, no HUD,
  SKIP >> for all of it): the camera on the cab, Tucker pops up out of the back of it (not at his window before: nothing
  to shoot), his manic face up close in a frame over his words: TUCKER_INSULT, Meathead's MH_COMEBACK, TUCKER_DARE
  (GIVE ME MY FOUR DOLLARS!), the KILL arrow drops in. Then played: the rant, the arrow. Any special weapon fired near
  him, or anything of it flying at his window, he DUCKS below the sill (TUCKER_DODGE: "NOT LEGAL TENDER!"; the first
  time, Meathead's MH_RAYGUN hint); only the plain RAY GUN's bolt through his window is the shot (the stand-in in the
  window is gone: nothing else can touch him). Then the eye close-up and the crash as before. All clean / shitty /
  naked; voiced.
- 2026-10-18 (playtest fix A2, the wilds' water, the user's: "the water sections for the logs should have leeches that
  slow you down, slowly drain health and disables charging when underwater. it goes away when you surface. that's the
  incentive to use the logs"): THE LEECHES (wilds/leeches.ts) are the swim deterrent, in every log crossing but the
  pond (layout.ts LEECH_WATERS: the pond stays the gentle log teach, falling in just a swim; the creek's sign teaches
  them: CREEK CROSSING / LEECHES. RIDE THE LOG.; the rapids': LEECHES. DO NOT SWIM.). UNDER = his head under the water
  (the same line his air goes by, frontier/air.ts: swimming and his top 6 px below the surface); SURFACED = anything
  else (head up for air, on a log, out on a bank). Under, the first latches on after 45 frames, then one every 75, up
  to 8, drawn on him (dark banded slugs hanging off him, wriggling); each slows his swimming (x(1 - 0.012n) a frame on
  his speed, a little off his strokes up); they drain 2 (x0.65, M2's softer hits) a tick, every 90 - 8n frames (30 at
  least), straight off his health (no knockback, no i-frames: m2:fr_leech, its hurt lines when one latches, its death
  screens); while any are on him the special's stripped (no lunge; one going is over). Surfaced, they all drop off at
  once, shaken off in a spray (flung off him, into the water or the dirt). Not enemies: no kills, no callouts. REMOVED:
  the trout's chase and bite at a swimmer (it only leaps at him on a log now, head height: duck or shoot it) and the
  snags (m2:fr_snag, their lines, signs and drawing). The creek's passing line is about the leeches now.
- 2026-10-18 (playtest fix C, the town and the mine; the user's notes verbatim in the job brief): BIGGER (the user:
  "the general size of everything should be larger here... not everything scaled up the same amount"): the fronts two
  stories and more (250-320 tall), doors 104 (a head over him), the water tower, wagon, wreck and coffin up, props a
  little; the town's stretch ~1.5x longer. The section widened to FRX+54800 and everything after it moved on 3000
  (logride FRX+56000, woods 68000, dirtbike 74000, arena 87000; all their code is x0-relative). The camera pulled back
  as the train's (town/view.ts: 0.8, 0.72 in the saloon, eased; the view is the screen for the rules).
- 2026-10-18 (playtest C): THE SALOON (the user's: more saloony, quite a bit larger, back door locked, BRAWL pops up the
  moment violence starts, everyone fights everyone, last man alive can leave): 1100 wide, two stories (the stage and its
  curtain, the piano under the stairs, two card tables, the long bar with its brass rail and spittoons, the back bar's
  mirror and bottles, the barkeep, the stairs to a balcony with three rooms, chandeliers, wanted posters; no moose).
  Calm till he starts it (any of them hurt or knocked about, or a shot of his in the room): BRAWL! on screen, the
  batwings barred, the camera on the whole room, and everybody at everybody (kinds.ts's saloon AI: the bouncer, two
  dancers and eight drinkers, a new kind m2:fr_patron, pick the nearest or him, punches, chairs broken over backs,
  bottles thrown at each other (bottles now hit the cast too), the bouncer throwing people across the room; the kills
  between them real, their callouts THROWN OUT! / CAN-CANNED! / CHAIRED! / KNOCKED OUT! / BOTTLED!). The last man
  standing (him) gets out: the back door unlocks (it says STAFF ONLY, padlocked, and Meathead says so if he tries it).
  OURS: if he starts nothing, the bouncer warns him at 8 s and starts it himself at 16 s. The barkeep (ducks) and the
  piano player (plays on) are scenery, not in the count. Won stays won (cp 23 past it, or a death after it this visit);
  the old two waves and the upstairs window are gone.
- 2026-10-18 (playtest C): THE SHOWDOWN, the user's confirmed design: a standard duel. Into the street, the gates shut
  and a cutscene (no controls, no HUD, SKIP >> for all of it): the announcer, the rules (nobody draws till the sheriff
  says DRAW), the sheriff's line, Meathead's; he's walked to his mark. Then the duel is his trigger finger only (no
  walking, no moves): the ray gun's forced on for it (lockWeapon; he's left holding it after, as the land's other forced
  weapons leave him), he stands squared up in a gunslinger pose (moves.ts drawGunslinger: the gun in his belt, his hand
  hovering over it; a shot snaps him out into the engine's firing), the sheriff's fingers twitch, then DRAW! (2.7-5.5 s
  in, random). Fire within DRAW_WINDOW (34 frames) after it: the sheriff's OUTDRAWN!, done. Too SLOW: the sheriff's one
  shot, the special death (town/duelDeath.ts, m2:fr_duel: a hole clean through his face with the sky through it, he
  stands a beat swaying, the hole smoking, then over backward stiff as a board, a tumbleweed rolls by; its hurt lines,
  death lines, death screens). Fire BEFORE the DRAW: cheating: the sheriff's dead (SHOT FIRST!), the crowd turns, and
  his posse comes after him (two waves of sheriffs and deputies, ordinary enemy logic, no one-shots); all down, done.
  No obstacles in the lane during the duel: the barrels are gone, the trough stands behind the sheriff's mark (cover for
  the posse fight only). The sheriff can't be hurt before the duel (refilled). Done stays done like the saloon.
- 2026-10-18 (playtest C): the jack ladder's log rides up lying along the chain (tilted to its slope, no rolling), laid
  flat again as it's tipped onto the deck; Meathead tilts with it (spriteRot) and straightens off it. The mine's lights
  muted like the train's tunnels (dark 0.5-0.78, never black; rim 0.22; lanterns soft warm glows r120 a0.32, the
  saloon's chandeliers soft too). The flooded shaft made a long swim (13000-14420: under a long rock, down under a hump
  and up), NO air pockets: ~11-12 s for a quick swimmer (about half his air), dawdling drowns him; a FLOODED / LONG
  SWIM. NO AIR POCKETS. board before it. No leeches in the mine. The log ride's queue sold as a long wait (switchbacks
  three rows deep on a stepped plank deck, WAIT FROM HERE boards 90 / 75 / 60 / 45 MIN, bored guests packed in, a rope
  barrier, the flume on its trestles behind with a log coming down, the station's marquee THE LONGEST LOG RIDE IN THE
  WEST); every row stands on the deck, the flume's legs reach it, and nothing's drawn over the far shaft's mouth (posts
  at its edges, its own MINE EXIT headframe, the ground right up to it).
- 2026-10-18 (playtest fixes D, the log ride and the woods; the user's notes verbatim in the job brief): IN THE WATER
  (the user: "sell the idea it's in water more"): the log bobs on the flat, ripples spread off it, its wake trails in a
  V, a bow wave curls off its nose, foam rings its foot, spray off the nose going, the water see-through over its belly
  (the flume's near wall drops to just under the surface, the surface banded and rippling by), the water lapping (and
  the real river rushing) in the sound. THE HOP (the user's): left or right during a hop carries him a little back or
  on along the log (2.4 px a frame, up to 44 off its middle) and the log always follows, catching up under him (on the
  free stretches; not on the chain or down a drop); he faces the way he goes (left/right in the log turns him).
- 2026-10-18 (playtest D): HIS SEAT (the user's "resembles the shape of the car"): Player.logSeat, a new render pose
  (render/player/player.ts, on the mine cart's seat): sat down in the log, legs out forward down in it (hidden by its
  near side), the free hand gripping the rim, the gun out; ducked, hunched right down in it (and 10 px lower). Stood up
  out of it in a hop. THE DUCKS (the user's "make sure ducking clears..."): every duck-under comes down solid to one
  line, DUCK_LINE 44 over the water (layout.ts), drawn and hit alike: his ducked head tops out 28-30 over the water,
  well under it; sat up, 58-64, well over. The wall saws' bulkheads down to the saw with a DUCK plate and arrow, the
  swing's arm shortened to bring it to the line, the sewer's pipes and the river's limbs to it (their hit as wide as
  drawn).
- 2026-10-18 (playtest D): THE BOOTH (the user's): no saw over the console before; the button lights BUZZSAW MODE (a
  panel over the console, flashing from then on) and the ride's PA chirps it (SPIEL_BUZZMODE: no talk-over, the drop
  waits on it); then the saw drops out of the sky, down through the station's roof and the booth's (holes left in both,
  splinters, daylight down them) into his forehead; the close-up's blade comes down loose (no arm).
- 2026-10-18 (playtest D): THE BIG SPLASHES (the user's: every fall): a giant wave off the foot of every drop (the big
  drop, into the sewer, into the river, the waterfall): walls of water up either side of the log (the front one the
  big one), the crest breaking, white water boiling, spray over everything, the water running down the screen.
- 2026-10-18 (playtest D): THE BREAK (the user's: the giant buzzsaw slams into the ground, opens a fault line, the ride
  breaks apart, he falls into the sewer): played, not a cutscene (the log's on rails there anyway): the giant saw drops
  out of the sky and slams half into the ground at 5720 (the shake, dirt flying, grinding in the gouge after); a fault
  line cracks open, running off along the ground both ways, the chasm (5690-5850) tearing open down to the sewer's
  vault; the flume over it breaks apart (both ends splintered and sagging into it, the water pouring off); the log
  rides on to it and drops through nose first, into the sewer: the big splash, the vault's hole and daylight overhead.
  No storm grate. Respawns past it see it done (the chasm open, the saw in the ground).
- 2026-10-18 (playtest D): THE SEWER (the user's: natural pipes; jumping and ducking and rats; no buzzsaws): the rolling
  saws are gone; the low pipes are a stack of round pipes end-on down from the vault on a rusted hanger (flanges, bolts,
  slime, a drip) to head height; BUSTED PIPE sections (a concrete culvert section fallen across the channel, half sunk,
  rebar out of it) to jump (the log bucks over: in the air or his tailbone, m2:fr_junk: its lines and death screens);
  the gushers pour from round outfalls; a water main with its joints along the back wall.
- 2026-10-18 (playtest D): THE RIVER: rocks stick well up out of the water (jagged, foaming round them, the crew's orange
  blaze on each), the crew's hand-painted ROCKS! JUMP EM and LOW LIMBS DUCK! boards before the first of each; each
  limb a wall of leaves down onto one great limb at the duck line, its underside scraped pale, DUCK sprayed on it.
- 2026-10-18 (playtest D): THE CREW (the user's: killable; "throw them in the woodchipper yourself if you are skilled"):
  a new kind m2:fr_logger (logride/kinds.ts: hard hats, ear defenders, hi-vis over flannel, chainsaws; men and women,
  seeded), two on the clearing, which is widened to FRX+67900 for them. They yell JUMP as he comes (the alive one), then,
  him down on their clearing on foot, sore about their log (CREW_MAD), they come at him: the saw revved up overhead (the
  tell: the roar, smoke, the chain sparking), then the lunge (m2:fr_chainsaw: its lines and death screens). Anybody flung
  or thrown into the running chipper's hopper (a logger alive or a body; a throw, a knock, a corpse going over) goes
  through it: red and meat out the chute over the truck, CHIPPED! (a new callout of its own, the announcer's).
- 2026-10-18 (playtest D): KILL CALLOUTS ON DESPAWN (an engine fix, m1/game/enemies/enemies.ts knockedOutOfBounds, every
  land): only an enemy that's just gone out over the screen's top or bottom edge itself (within 90 px plus its own speed
  of it) counts as knocked out; one the view jumped away from (a teleport into the next area: here, the river's crows
  left far under the woods' view) is left alone: no kill, no callout, no drop. One dropping on forever out there is let
  go quietly (2400 px under the screen).
- 2026-10-18 (playtest D): THE WOODS: the poison ivy an obvious trap: a toxic green, a pulsing glow over each patch
  (and a light of its own at dusk), spores shimmering up off it. Lots more trash (cans, bottles, fast-food bags and cups,
  pizza boxes, tires, a cooler, the cart, the mattress), none of it in the ivy, on the trap or in the way. The log
  ride's station queue sold as the town's line's last stretch: two switchback rows on the platform (the back one on a
  dimmed step), every rail on its posts, packed, the town's yellow boards (15 MIN FROM HERE, NEXT LOG. ALMOST THERE).
- 2026-10-18 (job C2, THE CRASH; the user's: "when the train crashes in the station, make it look more devastating as
  tucker flies from the wreckage and lands face first in the dirt as paramedics pick him up and carry him to first
  aid"): the train no longer flashes white and fades at the stop. Slumped on the whistle, faster, the station's sign
  coming up, a dip to black (train/engine.ts 'crash': 16 frames, still flat out), and the crash itself is the town's
  own cutscene (town/crash.ts; a run-through hands it over with takeCrashScene; a SKIP >> on the train skips the lot,
  straight to the aftermath; one cutscene all through: no HUD from the first frame, no controls, SKIP >> any time lands
  on the aftermath). The wide shot (the camera pulled back to 0.62 and eased back to the town's 0.8 for the
  paramedics; its middle never left of the section's start, so the train's stretch stays off screen): the train flat
  out along the last of the line, the whistle on, guests on the platform screaming and running for it (they end up
  well back past FIRST AID, gawking); the engine (the train's size, 600 long) through the buffer stop (its timbers
  flying), the platform's canopy smashed down onto it, the rails torn up and curled, the engine plowing on through the
  dirt (sparks, dirt thrown up) and stove into the depot's front (a hole, boards everywhere), nosed down, its back end
  up; the tender rides up onto the cab, the coach behind jackknifes the other way (its nose in the dirt, its back end
  up in the air); steam bursting out of the boiler, debris raining, a dust cloud rolling over it, fires catching in
  the cab, on the coal and in the coach; a big shake for the hit and one for each car. TUCKER (the full figure, the
  eye shot through, limp) is thrown out of the cab in a long tumbling arc and comes down FACE FIRST in the dirt (a
  skid, a spray of dirt, his face buried in it), his cap down after him. Meathead tumbles out of the cab (ARRIVE). The
  park's paramedics (white shirts, navy trousers, a red cross; a woman and a man) run round from behind FIRST AID with
  a stretcher, roll him over onto it face up (the hole through his eye), his cap on his chest (MEDIC: a new pool, the
  townsfolk voices), and carry him in head first through the opened door (STRETCHER as they go; the nude pool's sheet
  lines replaced). Ours: no sheet now. Never alive: the coffin stays empty (COFFIN's clean line: FIRST AID'S STILL GOT
  HIM). The wreck stays for the visit (art.ts's end of the line draws it): all background, nothing on it to stand on
  and no lit tops on it; the fires smoldering (lights of their own after dark), the steam still pouring and hissing,
  the debris where it came down (the scene's own, kept through a death; skipped, strewn the same way). The old tape and
  gawkers there are gone. The revisit as before (the stop rebuilt, REPAIRS BILLED TO: YOU KNOW WHO), the canopy back
  up. The ground drawn from x -900 (the end wall still at the section's start).
- 2026-10-18 (job C2): THE TRESTLE'S LOW BEAMS made a real duck (the log ride's DUCK_LINE way): each beam comes down
  solid to BEAM_GAP (63) over the ride cart's floor, drawn and hit alike; it hits by his head's line as he's drawn
  (stood up 71 over his feet: well into it; ducked 55: well under it; a hop takes him into it), not his box (which
  never reached it before); its foot hazard-striped, a DUCK plate with a red down arrow on each. No other duck-under
  in the town or the mine.
- 2026-10-18 (playtest fixes E, the dirt-bike chase; the user's notes verbatim in the job brief): HIS PUNCH (the user:
  "more weight and oomph... his face gets in profile... with a scowl like he wants you fucking dead"): cocked back a
  beat (PUNCH_WIND, 7 frames: the fist pulled up by his ear, his shoulders twisting away from it), then thrown hard
  (the arm right out past where it was, the fist bigger, a blur behind it, his whole upper body twisting into it and
  over), back over 24 frames in all; from the cock on, his head swings round in PROFILE at whoever he's hitting: the
  brow crushed down over a slit of an eye, the nose out, the jaw jutting, the lips pulled back off clenched teeth, a
  vein up his temple (art.ts mhHead; the same head through every parry). The blow lands at the end of the cock (a
  teen caught mid-swing by then is still parried): a 5-frame hit-stop, the shake, an impact star on them, a spray of
  blood, and the teen THROWN BACK (back 90 and out, slowed) and recoiling in pain (RiderPose.pain: the body flung away
  from him, the head snapped back, the arms off the bars, turned half round wincing, a howl, blood off the nose in an
  arc). The count: teens take one more punch than before (3 early, 4 later, +1 heavy) on top of the wind-up and the
  push back (ours: "a couple more" read as the extra punch plus the wind-up). SOUND: both punches the same: a low
  heavy whoosh as it's thrown, the punch's impact and a slam under it when it lands, nothing on a miss (the miss was a
  high-pitched whoosh, the likely "pew"; no gun sound is involved: the chase takes every control).
- 2026-10-18 (playtest E): EVERY KILL WIPES OUT IN FRONT OF HIM (the user's): any kid off their bike (punched off,
  shoved into the roadside, blown up by the chain's bomb, bowled by the nunchucks from way back in the pack: those sail
  right over him) is flung to come down 520-840 ahead in his lane, tumbling, then lying there; their bike skids off to
  the side. Run over a body (or a tumbling one once it's come down) and it bursts (a red banded burst, chunks of them in
  their shirt and pants colors, bone, a red smear left on the road; SPLAT! / GIBLETS! / SPEED BUMP! / SPLATTER!) and
  ramps him up (BODY_V 22; the hockey stick's human ramp the same, higher: RAMP_V 28). Just for fun: it never hurts
  him (no new hurt). Parry kills: the bat's kid splats into the tree (now a blood-splatted oak, a shoe in the leaves)
  and peels off it back out into the road ahead; the crowbar's faceplant and the hockey stick's ramp are bodies ahead
  already; the skateboard's blind rider is thrown back off whatever they hit into the road ahead; the chain's kid is
  the human bomb itself (the user's gag: no body, the blast's victims leave theirs ahead); the nunchucks' kid is still
  slung back past the camera into the pack (ours: the gag kept; the pack they bowl over sails over him and lands
  ahead).
- 2026-10-18 (playtest E): THE PARRIES UNTOLD (the user's: "don't put in an exclamation point... nor tell the player
  about it"): no "!" over a winding teen, no white flash on the weapon, no PARRY! pop, the controls card's parry line
  gone; the only tell is the wind-up itself (the weapon cocked up behind them, quivering as they put their back into
  it). FUNNIER PARRIES (the user's; the gags ours): BAT: caught, BONK BONK BONK on their head (squashing it down each
  time, the stars coming out, their head wobbling side to side), a wind-up, HOME RUN! into the tree. CROWBAR: hooked
  in the back of their pants, hoisted off the bike by the underwear and hung up there kicking (WEDGIE!, the waistband
  stretching), then slung face first into the road ahead (FACEPLANT!). NUNCHUCKS: clonked about the face with them four
  times, left right left right, teeth flying, the head snapping (WA-TAH!), then round the neck and slung back into the
  pack. HOCKEY STICK: in the spokes: ENDO!, the bike stood up on its nose with the kid hung upside down over the bars,
  legs flapping, a long wobbling beat, then over into the human ramp. SKATEBOARD: CLONK, CLONK on the head with it
  (squashed, dazed), then down over their head (NECK BOARD!), ridden blind with both arms waving. Each 0.4-0.8 s.
- 2026-10-18 (playtest E): THE ROAD: LOW things (logs, rocks, stumps, dead cows and deer) no longer bail him: they kick
  him up into the air (LOG_V 15, a thud, dirt or blood flying); only TALL things (trees, cows, deer, posts, hay bales,
  the outhouse, the tractor, towers) wipe him out. THE CREEK slows him (bogged down to ~26 MPH while he's in it, spray
  up both sides, the bike shuddering, a splash going in) and never wipes him out (m2:fr_bail_creek and m2:fr_bail_log
  stay registered, unused). HIS JUMPS much higher (JUMP_V 25 on his own gravity 0.8: ~390 up, over a second in the air;
  the dirt jumps 17): anything tall is cleared once he's over 70% of its height (cows, deer, posts, hay bales; never
  trees or towers); the landing a thump by how far he fell (a thud, the shake, dust).
- 2026-10-18 (playtest E): THE RIDERS VANISHING DOWNHILL (the user's bug): down a steep hill the camera (kept 700 over
  the road under HIM) sank under the road behind him, which then projected up off the top of the screen and clipped
  every rider past it. The camera now keeps 700 over whichever is higher, the road under him or under it; road nearer
  the camera than 450 never clips; riders and Tucker partly behind a real crest are cut at it, not hidden whole.
- 2026-10-18 (playtest E): BLOODIER AS HE'S HURT (the user's): his from-behind figure by the health he's lost (art.ts
  MhPose.blood): past 15% road rash on his shoulder blades; 35% bruises, blood smeared down his back, scraped
  forearms, bloody knuckles; 55% his jeans torn through at the knees and the seat (skinned raw under them; naked: his
  cheeks scraped raw), streaks down his back to his belt, a gash in his scalp running down his neck, blood off his lip
  in profile; 75% the lot dripping (off his back, his ear), the waistband soaked. Clean, shat and naked alike.
