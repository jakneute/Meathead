# Hollywood Land: who owns what

The design and the standing rules: `hollywood-spec.md` (in this folder; given to every agent: the user's design
verbatim, the theming, the rules, each owner's brief). Each section's index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Agent | Folders | Sections (checkpoint numbers) |
|---|---|---|
| Outdoors | `blvd/`, `lot/` (+ the stunt wires: build them FIRST) | blvd (0-9), lot (30-39) |
| Coaster | `coaster/` | coaster (10-19) |
| Warehouse | `warehouse/` (incl. the Ensemble Cast sub-boss) | warehouse (20-29) |
| Havoc | `havoc/` | havoc (50-59) |
| Disaster | `disaster/`, `stunt/` | disaster (40-49), stunt (60-69) |

Inside your folders, anything goes: split into layout.ts, art.ts, people.ts, kinds.ts and so on, as the other lands'
sections do. Number your checkpoints only inside your range (they're numbered across the whole land and sorted; the
CHECKPOINT SKIP cheat lists them all). Each stub has one checkpoint at its start; keep it (or move it) and add more.
Your lines go in your folder's `lines.ts` `VOICE_LINES` (by voice id).

## Length budget (the user: every land about as long to play as Adventure Land)

Adventure Land's sections add up to ~76500 world px of play, plus its cutscenes and the boss. Count rides and vertical
parts by how long they take to play, not by their x width. Meathead walks ~210 px/s; "played" times assume fighting
and platforming on the way (about 2.5x pure walking). Build to your target and report your section's length and
estimated playtime.

| Section | x range now (world) | Target (px of play) | Target playtime (excl. cutscenes) |
|---|---|---|---|
| blvd | HWX+0 .. HWX+11500 (11500) | 11500 | ~2.3 min |
| coaster | HWX+14500 .. HWX+29500 (15000) | 15000 (rides + three stop fights) | ~3 min |
| warehouse | HWX+32500 .. HWX+45000 (12500) | 12500 + the Ensemble Cast | ~2.5 min + the fight |
| lot | HWX+48000 .. HWX+57000 (9000) | 9000 | ~1.8 min |
| disaster | HWX+60000 .. HWX+66000 (6000) | 6000 | ~1.2 min |
| havoc | HWX+69000 .. HWX+88500 (19500) | 19500 (the flood climb counted by playtime) | ~4 min |
| stunt | HWX+91500 .. HWX+94500 (3000) | 3000 (the arena) | the boss fight |
| **total** | | **~76500** | **~15 min + cutscenes + two fights** |

HWX = 500000. Need more x room? Widen your x1 into the gap after it (re-read geometry.ts first); the gaps are 3000.
Vertical parts (havoc's flood climb) go up in -y from GY.

## Shared files (the skeleton's owner's)

- `index.ts` (the stage: routing, camera, checkpoints, grace, portal arrival, gathering the stunt wires, HUD zone,
  bumping the land visit on a fresh entry)
- `geometry.ts` (SECTIONS x ranges, SECTION_ORDER, DOORS: the arrival points between sections)
- `section.ts` (HollywoodSection, StuntWire, Hollywood, hollywoodState, hollywoodWires, landVisit, the crude
  exits/ground/sign/backdrop helpers, happywoodHill, steveFlier; re-exports adventure/section.ts)
- `voices.ts` (HOLLYWOOD_VOICE_LINES: gathers every section's lines.ts)

Section owners may only **append minimally** to these (e.g. widen your own section's x1 into the gap after it, move
your own DOORS entry, add a new lines file to voices.ts, extend StuntWire), and must **re-read the file right before
editing**: others are editing in parallel. Never reformat or reorder them. Outside src/m2/hollywood, shared engine/M2
files (App.tsx, hudThemes.tsx, kinds.ts, roster.ts, tools/voices/cast.json, the engine's player code...) are the same:
re-read, append minimally.

## How sections connect (crude, for now)

Each section's ends have walls; walking into its right end puts him at the next section's `DOORS[next].start`, its left
end at the previous one's `DOORS[prev].end` (`endExits(id)` + `runExits`, in each section's update). Replace your own
with the real thing (the coaster's launch, the ride's doors, the fling...) and move your DOORS entries to match; keep
the way back working (revisits), or give a one-way set piece a sane way to return:

- **The coaster's launch** (coaster -> warehouse) is one-way. Back from the warehouse, he's put at the third stop by
  the booth (`DOORS.coaster.end`); the coaster owner gives him a way down from there (the train back with the lever
  off, or the stop's service stairs).
  **Built:** the launch puts him at `DOORS.warehouse.start` flying in (vel +6, -5), sets `COASTER_LAUNCHED_MEMO`
  (section.ts) and `noteBurstIn()`; the warehouse calls `takeBurstIn()` (true once per launch) to run its burst-in
  (the walls coming down). The lever stays on EXPERIMENTAL, so riding from stop 3 again launches him again.
- **The bulldozer** (warehouse -> lot). **Built** (warehouse/ending.ts): after the Ensemble Cast, a cutscene pushes the
  pile through the warehouse's far wall; its last beat is shot at the lot's start (LOT_WALL_BREAK, LOT_DUMPSTER: the
  bodies out of the hole into the dumpster, the dust settling on the lot's crashed bulldozer) and he's let go there,
  hopping down by the dumpster (lot.x0 + 312). From then on (`hollywood-warehouse-leak` in state.stageMemo) the far wall
  is open both ways: the lot's left end back in at `DOORS.warehouse.end` (just inside the hole, on the one-screen main
  stage), out through the hole (warehouse/layout.ts FAR_WALL) to `DOORS.lot.start`.
- **The fling** (havoc -> stunt) is one-way. Back from the stunt stage, he's put where the tornado caught him
  (`DOORS.havoc.end`, on the ground); the havoc owner keeps that spot reachable on foot both ways (the tornado's spent
  on a revisit).
  **Built** (havoc/fling.ts): past the first aid station the tornado surges and gets him; the cutscene ends with him
  put at `DOORS.stunt.start` (on the ground, a thump in the dust, the HUD back). From then on (`hollywood-havoc-flung`
  in state.stageMemo, or the checkpoint's 60+, or the land's cleared) the tornado's spent and the havoc's right end goes
  on to `DOORS.stunt.start` on foot.

## Stunt wires (the land's new mechanic)

`HollywoodSection.wires(state)` returns the section's `StuntWire`s (section.ts: `from`, `to`, `rigY?`, `speed?`,
`off?`). The stage gathers every section's each frame into the stage's own list (`hollywoodWires(state)`). The
**Outdoors** owner builds the grab / pull / swing / let-go (say in `hollywood/wires.ts`, added to the shared list here)
and its drawing, and teaches it on the blvd; everyone else just returns wires.

**Built** (`hollywood/wires.ts`, run by index.ts after the section's update, drawn after the sections' drawBack, the
camera row while on one), **reworked to the user's playtest notes**: jump into the harness or walk up to it (no button);
the trolley runs the way he faces (left/right turns him and pumps the swing) and stops at either end of its track, where
he HANGS (it never lets him go); up reels the cable in, down pays it out; the charge button thrusts him forward the way
he faces (the engine's own shoulder charge: it hurts and shoves whoever he hits; up/down with it are nothing special);
charging at the end of the track with room above him is THE SWOOP, a launch up a good way (~300 px) off the end of the
line. He gets off ONLY by jumping (or the swoop), or knocked off by getting hurt. The trolley dragging him into
something solid hoists him over it (reels him in). He shoots the whole way. `from` is where the harness hangs (his
hands: 80 over his feet), `to` his feet at the far end (so put an end stop with something to jump off onto, or a high
ledge to swoop up to). A rig parks at whichever end it last went to (so it takes him back too); `shuttle: true` runs
on its own loop while nobody's on it; `off: true` hangs slack.
**Keep each section's list in a steady order** (wires are matched frame to frame by their place in the list): switch
one `off` rather than leaving it out. `onWire(state)` if you need to know.

## Levers thrown by hand (shared)

`hollywood/lever.ts` (the coaster owner's, for anyone): a lever he hauls over with the engine's own pose
(Player.leverPull, him from behind, both hands on the grip). `startThrow()` when up's pressed at it, `tickThrow(state,
lever, throw)` every frame ('busy': give him no controls; 'thrown': the frame it hits its stop; 'done'), draw the handle
at `throwAngle(lever, throw, flipped)`. The coaster's RIDE MODE lever uses it; **Disaster: The Ride's REAL DISASTERS
lever can use it as it is.**

## Things that outlive a death

`state.stage` is rebuilt on every death. What has to outlive one (havoc's "died to the tornado") lives in its own
module, keyed by `landVisit()` (section.ts), which index.ts bumps only on a fresh way into the land (the hub's portal,
the checkpoint-skip cheat, the dev start). See havoc/index.ts: `noteTornadoDeath()`, `diedToTornado()`.

## Stuntman Steve, foreshadowed

The user: his presence foreshadowed many, many times through the whole land. Every section puts up fliers, posters,
standees (`steveFlier(c, x, y, 'flier' | 'poster' | 'standee')` in section.ts, or your own art) and PA plugs.

## The land's end

`stunt/` holds the skeleton's stand-in: past the middle of the stage it's VICTORY, the walk-away
(`walkAway/stuntmanSteve.ts`, a placeholder SceneDef registered as `'stuntman-steve'` in walkAway.ts; the STUNT_CAR)
and the hub, Hollywood Land cleared. The fight isn't designed yet (the user's to do). The portal walk in is
`walkAway/intoHollywood.ts` (crude; the blvd's owner may bring the blvd's painting into it).
