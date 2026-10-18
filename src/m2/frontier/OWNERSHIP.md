# Wilderness Land: who owns what

The design and the standing rules: `frontier-spec.md` (in this folder; given to every agent: the user's brief
verbatim, the fill-ins, the rules, the section plan). Each section's index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Job | Folders | Sections (checkpoint numbers) |
|---|---|---|
| 1 (done) | `wilds/`, `tucker.ts` | wilds (0-9) |
| 2 (done) | `train/` (and tucker.ts's eye wound) | train (10-18) |
| 3 (done) | `town/` | town (20-29) |
| 4 (done) | `logride/` (and tucker.ts's saw wound, its poses 'shove' / 'slam' / 'press') | logride (30-38) |
| 5 (done) | `woods/` (and tucker.ts's `grime` look, its poses 'pop' / 'pounce' / 'ride' / 'ridepoint') | woods (40-41) |
| 6 (done) | `dirtbike/` (incl. the TEENAGERS sub-boss; appended store.ts bikeHud/bikeBoost/bikeTips and App.tsx's bike HUD + controls card) | dirtbike (50-55) |
| 7 (done) | `arena/` (the catch-up, the impalement, the fake-out and its retry entrance beat, the fight's placeholder; and tucker.ts's `branch` wound, the pose 'impaled', `onBranch`, IMPALED_TILT / tuckerPoint, drawBough, drawCloseupBranch) | arena (60) |
| later | `arena/` (Tucker's fight, when the user gives it: it starts at intro.ts's `onUp`) | arena (61-69) |

Inside your folders, anything goes: split into layout.ts, art.ts, kinds.ts and so on, as `wilds/` does. Number your
checkpoints only inside your range (they're numbered across the whole land and sorted; the CHECKPOINT SKIP cheat
lists them all). Each stub has one checkpoint at its start; keep it (or move it) and add more. Your lines go in your
folder's `lines.ts` `VOICE_LINES` (by voice id; voices.ts gathers them, so they're recorded and never weeded out).

## Length budget (the user: every land about as long to play as Jungle Land)

Jungle Land's sections add up to ~76500 world px of play, plus its cutscenes and the boss. Count rides, vehicles and
vertical parts by how long they take to play, not by their x width. Meathead walks ~210 px/s; "played" times assume
fighting and platforming on the way (about 2.5x pure walking).

| Section | x range now (world) | Target (px of play) | Target playtime (excl. cutscenes) |
|---|---|---|---|
| wilds | FRX+0 .. FRX+21000 (21000) | ~24000 (platform heavy, the logs) | ~5 min |
| train | FRX+24000 .. FRX+36000 (12000) | 12000 | ~2.5 min |
| town | FRX+39000 .. FRX+50000 (11000) | 11000 (the mines' shafts counted by play) | ~2.3 min |
| logride | FRX+53000 .. FRX+64600 (11600) | 9000 (a ride: by time) | ~2 min |
| woods | FRX+65000 .. FRX+68000 (3000) | 3000 + its scene | ~0.6 min |
| dirtbike | FRX+71000 .. FRX+81000 (10000) | by time: the TEENAGERS | ~3 min |
| arena | FRX+84000 .. FRX+88000 (4000) | the catch-up + the boss | the fight |
| **total** | | **~76000** | **~15 min + cutscenes + two fights** |

FRX = 700000. Need more x room? Widen your x1 into the gap after it (re-read geometry.ts first); the gaps are 3000.

## Shared files (the skeleton's owner's)

- `index.ts` (the stage: routing, camera, checkpoints, grace, portal arrival, swimming and air, drowning, the HUD zone)
- `geometry.ts` (SECTIONS x ranges, SECTION_ORDER, DOORS)
- `section.ts` (FrontierSection, frontierState, landVisit, byPants/pantsOf, the crude exits/walls; re-exports
  adventure/section.ts and Hollywood's crude drawing helpers)
- `kit.ts` (the crude painting kit: frontierSign, frontierSky, burned / painted letters)
- `talk.ts` (ByPants, TUCKER_VOICE: pure data, node-safe), `lines.ts` (land-wide lines), `air.ts` (swimming, air)
- `stub.ts` (the stand-in sections), `voices.ts` (FRONTIER_VOICE_LINES: gathers every section's lines.ts)
- `tucker.ts` (Tucker, drawn at full detail: everybody draws him from here; see below)

Section owners may only **append minimally** to these, and must **re-read the file right before editing**. Never
reformat or reorder them. Outside src/m2/frontier, shared engine/M2 files (App.tsx, hudThemes.tsx, kinds.ts,
tools/voices/cast.json, the engine's player code...) are the same: re-read, append minimally.

## Tucker (tucker.ts)

`drawTucker(c, x, feetY, facing, frame, pose, wounds?)`: the full figure, any pose the scenes have needed so far (see
`TuckerPose`); `wounds` (`TuckerWounds`: `eye`, `saw`, `branch`, `grime`, booleans) STACK: each job that mutilates
him adds its wound's drawing to the figure (all four drawn now; `tuckerWoundsOf(state)` in section.ts). `drawTuckerCloseup(c, cx, cy, scale,
frame, opts)`: his face at close-up size (the station's furious shout uses it); `opts.making = { wound, k }` is the
mutilation close-up rule's hook: register a painter per wound (`registerWoundPainter(wound, paint)`) that draws the wound
being made at `k` 0..1 over the face (multi-frame, gory, ANIMATED: the user's rule). His voice: `TUCKER_VOICE`
(talk.ts), `m2.frontier.tucker` in cast.json. He's unkillable until the fight's grizzly: never let a stray hit kill
him in a scene (the station makes him a mid-boss stand-in that's refilled every hit).

## How sections connect (crude, for now)

Each stub's ends have walls; walking into its right end puts him at the next section's `DOORS[next].start`, its left
end at the previous one's `DOORS[prev].end` (`endExits(id)` + `runExits`). Replace your own with the real thing and
move your DOORS entries to match; keep the way back working (revisits), or give a one-way set piece a sane way back:

- **The station -> the train** (built, wilds/station.ts): the train speeds off, he runs after it; the scene ends with
  him at `DOORS.train.start`. Back from the train's left end: `DOORS.wilds.end` (on the platform). The train section
  plays the caboose jump-on from there (train/index.ts).
- **The crash** (train -> town, built, train/engine.ts): the crash puts him at `DOORS.town.start`. Back from the town's
  left end: `DOORS.train.end` (the tender's front, set by train/index.ts): the train stood still after the crash (walk it
  back to the caboose and the station); into the cab's back goes on to the town again.
- **The woodchipper** (logride -> woods, built, logride/chipper.ts): he lands on the crew's clearing past the chipper
  and walks off its right end to `DOORS.woods.start`. Back from the woods: `DOORS.logride.end` (on the clearing, set by
  logride/index.ts); its left end is the trail back to the ride's station.
- **The bike** (woods -> dirtbike, built, woods/scene.ts): the bounty ends with him riding off on the kid's bike and
  puts him at `DOORS.dirtbike.start` (on foot, his ride flags cleared); `takeBountyHandoff()` (woods/scene.ts) is true
  once after that, for the chase to start him on a bike. Back from the chase: `DOORS.woods.end` (the lot, the scene
  done); the woods' right end goes on to the chase's start on foot once the bounty's been. The kids: woods/teens.ts
  (teenOf, drawDirtBike, drawTeenPerson) and their voices (woods/lines.ts TEEN_VOICES) are there to reuse.
- **The catch-up** (dirtbike -> arena, built on the chase's side, dirtbike/chase.ts): the last teen down, the outro
  (Tucker off into the trees, black) puts him at `DOORS.arena.start` on foot, his bike flags cleared;
  `takeChaseHandoff()` (dirtbike/index.ts, from chase.ts) is true once after that, for job 7's catch-up to start him on
  (or with) the bike. `TEENS_MEMO` ('frontier-teens-done') says the chase is beaten. Back from the arena:
  `DOORS.dirtbike.end` (the side view's trail, x0+1500; set by dirtbike/index.ts); its right end (x0+1800) goes on to
  `DOORS.arena.start` once the chase is beaten, its left end back to the woods (`DOORS.woods.end`).
- **The arena** (built, arena/): the first frame there with the catch-up not done (in off the chase, or walked in), the
  catch-up plays (arena/catchup.ts); BRANCH_MEMO says it's been, UP_MEMO ('frontier-arena-up') that he's up off the
  branch (arena/state.ts). The fight, when it comes, hangs off intro.ts's `onUp` (index.ts `fightOn`); a retry's
  entrance beat is intro.ts's startEntrance / tickEntrance.

## Things that outlive a death

`state.stage` is rebuilt on every death. What has to outlive one lives in its own module, keyed by `landVisit()`
(section.ts), which index.ts bumps only on a fresh way into the land. What has to outlive the visit (the station scene
done: `STATION_MEMO` in state.stageMemo) goes in stageMemo.
