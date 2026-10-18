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
  in its way). The small ones (doe, wolf, beaver, rattler, crow, porcupine) go down to a charge, a slide or an uppercut.
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
| 2 | The train | `train` | FRX+24000 .. FRX+36000 | 10-19 | built (job 2) |
| 3 | Sawdust Gulch + the mines | `town` | FRX+39000 .. FRX+50000 | 20-29 | built (job 3) |
| 4 | The log ride (ride, sewer, real river, woodchipper) | `logride` | FRX+53000 .. FRX+64600 | 30-38 | built (job 4) |
| 5 | The woods (outside the park) + the bounty | `woods` | FRX+65000 .. FRX+68000 | 40-41 | built (job 5) |
| 6 | The dirt-bike chase (TEENAGERS sub-boss) | `dirtbike` | FRX+71000 .. FRX+81000 | 50-59 | stub |
| 7 | The catch-up + Tucker's arena | `arena` | FRX+84000 .. FRX+88000 | 60-69 | placeholder end |

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
| 6200 | THE CREEK | two logs and a stepping rock; a beaver; a crow |
| 7800 | THE BLUFFS | a cougar on the bluff; a chain of loose ledges over a ravine (they come back a few seconds after they drop: the way back's the same) |
| 9300 | SNAKE FLATS (cp 2) | the first rattlesnake hole alone, then two with a trap between; a porcupine (no dive kicks) |
| 10400 | THE RAPIDS | current; two channels and a rock island; submerged rocks buck the log; low branches; beavers |
| 13100 | BISON MEADOW (cp 3) | a bison; bucks; the log pile rolling logs down the hill he climbs |
| 15200 | THE LONG RIVER | one log down a long river: wolves and a cougar on fake-rock overhangs over the water (they leap down at him), a hive hanging off one, beavers, crows, a fallen tree to duck; the log boom and the falls at the end: jump off to the far cliff |
| 17800 | THE LAST MILE (cp 4) | a wolf pack, crows, the trap gauntlet with ledges over it, the tracks begin |
| 19300 | THE STATION (cp 5) | Tucker, the train, the scene |

### Section 2: the train (train/layout.ts: 26 cars, caboose at x0+1000, engine's nose at x0+11520)

| Cars | Checkpoint | What |
|---|---|---|
| 0-2 | THE CABOOSE (cp 10) | the run for the caboose (a cutscene); an empty boxcar: the first LOW BRIDGE alone; the first CUT, alone, on a flatcar of logs |
| 3-6 | THE COACHES (cp 11) | passengers (parasols, canes), a porter; a brakeman alone on a boxcar roof; an ore hopper |
| 7-9 | THE BAGGAGE CAR (cp 12) | the first tunnel (short, while he's inside); a porter among crates; a steer in a cattle car; the second cut, a brakeman on it |
| 10-12 | THE DINING CAR (cp 13) | the cook, passengers; the first robber riding up alone, then two; a tank car with a brakeman |
| 13-16 | THE WATER TOWER (cp 14) | the first water tower over a coach (get inside); two brakemen and a bridge; the third cut with a bridge coming; a tunnel; two steers |
| 17-20 | THE MAIL CAR (cp 15) | two porters; robbers; the long tunnels begin; the cook in the dark; the fourth cut, quick, in a tunnel, with a brakeman |
| 21-23 | THE LAST COACH (cp 16), THE LOG CAR (cp 17) | a water tower, robbers, a bridge, a long tunnel; the stack's cinders from car 22 on |
| 24-25 | THE ENGINE (cp 18) | the fireman's coal on the tender; Tucker, the KILL arrow, the rant; the shot, the close-up, the crash |

### Section 3: Sawdust Gulch and the mines (town/layout.ts; x from the section's start)

| x | Stretch (checkpoint) | What |
|---|---|---|
| 0 | END OF THE LINE (cp 20) | the smashed buffer stop, the engine nosed in steaming (the crash's visit), gawkers at the tape, the covered stretcher to FIRST AID; the depot |
| 500 | MAIN STREET (cp 21 at 1300) | deputies (alone, then a balcony), the snake-oil wagon (tonic clouds), the water tower's deputy, the barbershop quartet, the undertaker (the empty coffin: TUCKER) |
| 2500 | THE SALOON (cp 22 at 2440) | the brawl (doors barred, camera on the room): bouncer + can-can dancers, then a second wave off the balcony; out the upstairs window |
| 3300 | THE ROOFTOPS | false-front roofs over alleys (crates back up), deputies |
| 3900 | THE SHOWDOWN (cp 23 at 3920) | the Wild West Show's street: gates shut, the announcer, the sheriff (DRAW!, fans three), deputies on the balconies, then two more; trough and barrels stop shots |
| 4700 | THE LIVERY, THE SMITHY | farmhands (pitchforks: pointy), the hay loft, the blacksmith (hot horseshoes) |
| 5100 | THE MILL POND (cp 24 at 5250) | the bank feller's TIMBER! alone; pond A, one log; the island feller drops his pine across the water; pond B, the BIRLER ramming; the JACK LADDER up to the deck |
| 6800 | THE SAWMILL (cp 25 at 6840, on the deck) | belt one into the head saw (a log goes in first), over the saw onto belt two coming back with logs on it; a feller at the end |
| 7800 | THE LUMBER YARD | fellers with hatchets; the mine's entrance |
| 8300 | THE MOTHER LODE (cp 26 at 8050) | down the shaft's landings into the dark; a singing canary; the first cave-in alone; miners (candle hats: spiky) round a TNT crate; an ore chute |
| 8860 | THE CART TRACK | runaway carts (warned: jump them or the alcoves); a cave-in over the rails; a TNT crate in their way |
| 9230 | THE TRESTLE (cp 27 at 9265) | the ride cart over the chasm, low beams (duck), a prospector lobbing dynamite at the far end |
| 9670 | THE GAS (cp 28 at 9680) | the dead canary, FIREDAMP (a shot in it sets the pocket off), a prospector past it |
| 10000 | THE FLOODED SHAFT | dive under the rock |
| 10330 | UP AND OUT | landings up into the daylight |
| 10600 | TIMBER TUMBLE (cp 29 at 10660) | the log ride's queue (WAIT FROM HERE: 90 MIN), the station's front; off the right end into the log ride |

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
| 5360 | THE BREAK | the cutter comes down across the flume ahead of him: the log jumps the cut and goes down through a storm grate |
| 5840 | THE SEWER (cp 35 at 5900, cp 36 at 7060) | LOW PIPES (brick headers down to the pipe: duck), SEWAGE GUSHERS (gurgle and drip, then the pour: brake or paddle), RATS on the walkways (they leap at the log), loose saws ROLLING down the tunnel (jump) |
| 8400 | THE CULVERT | out of the bluff the park sits on through its busted fence (PARK PROPERTY ENDS), down the spillway into a real river |
| 8640 | A REAL RIVER (cp 37 at 8700, cp 38 at 10080) | ROCKS (be in the air as the log hits one), LOW BRANCHES (a fallen real tree's crown: duck), crows; the rapids; a real waterfall; the crew's WOODCHIPPER AHEAD sign |
| 10760 | THE SLUICE | the crew's conveyor up into the chipper: READY (amber), then JUMP! (green, flashing, the crew yelling it, ~110 frames): over the hopper onto the clearing; missed: mulched |
| 11180 | THE CREW'S CLEARING | off its right end into the woods; off its left end the trail back to the park (the station: ride it again) |

### Section 5: the woods (woods/layout.ts; x from the section's start; flat ground at GY)

| x | Stretch (checkpoint) | What |
|---|---|---|
| 0 | THE TREELINE (cp 40) | in from the crew's clearing (the left end goes back onto it, past the chipper); a real NO TRESPASSING sign nailed to a real tree (buckshot holes); power lines along the trail; the park's back fence and the backs of its painted mountains far behind |
| 500 | THE TRAIL | litter; a fallen tree over the trail (jump it or stand on it); POISON IVY alone (the scout troop's LEAVES OF THREE, LET IT BE); a crow |
| 1080 | A REAL BEAR TRAP | alone, rusty, chained to a stump in the leaves, no sign (a glint) |
| 1230 | THE BOULDER | jump from it over a wider ivy patch; a second crow |
| 1600 | THE DIRT LOT (cp 41) | the kids' spot: four riders doing laps over the jumps in its back lane, a ramp, a burnt couch, a fire ring, DIRT RATS sprayed on a boulder; the refill (big health, big ammo); the LEAF PILE by the trail (1700) |
| 1900 | THE BOUNTY | the scene (woods/scene.ts), then the kid's bike into the chase (DOORS.dirtbike.start). After: the lot empty, the pile scattered, the kicked-off kid sulking on a stump (2080); off the right end on foot to the chase |

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
