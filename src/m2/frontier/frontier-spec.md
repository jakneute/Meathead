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
| 2 | The train | `train` | FRX+24000 .. FRX+36000 | 10-19 | stub (job 2) |
| 3 | Sawdust Gulch + the mines | `town` | FRX+39000 .. FRX+50000 | 20-29 | stub |
| 4 | The log ride (ride, sewer, real river, woodchipper) | `logride` | FRX+53000 .. FRX+62000 | 30-39 | stub |
| 5 | The woods (outside the park) | `woods` | FRX+65000 .. FRX+68000 | 40-49 | stub |
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
| 7800 | THE BLUFFS | a cougar on the ledges; a chain of loose ledges over a ravine (the way back: a fallen trunk under them) |
| 9300 | SNAKE FLATS (cp 2) | the first rattlesnake hole alone, then two with a trap between; a porcupine (no dive kicks) |
| 10400 | THE RAPIDS | current; two channels and a rock island; submerged rocks buck the log; low branches; beavers |
| 13100 | BISON MEADOW (cp 3) | a bison; bucks; the log pile rolling logs down the hill he climbs |
| 15200 | THE LONG RIVER | one log down a long river: wolves leaping from the banks, a hive over the water, crows; the log boom and the falls at the end: jump off to the far cliff |
| 17800 | THE LAST MILE (cp 4) | a wolf pack, crows, the trap gauntlet with ledges over it, the tracks begin |
| 19300 | THE STATION (cp 5) | Tucker, the train, the scene |

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
