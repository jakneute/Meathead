# Wilderness Land: who owns what

The design and the standing rules: `frontier-spec.md` (in this folder; given to every agent: the user's brief
verbatim, the fill-ins, the rules, the section plan). Each section's index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Job | Folders | Sections (checkpoint numbers) |
|---|---|---|
| 1 (done) | `wilds/`, `tucker.ts` | wilds (0-9) |
| 2 (done) | `train/` (and tucker.ts's eye wound) | train (10-18) |
| later | `town/` | town (20-29) |
| later | `logride/` | logride (30-39) |
| later | `woods/` | woods (40-49) |
| later | `dirtbike/` (incl. the TEENAGERS sub-boss) | dirtbike (50-59) |
| later | `arena/` (incl. Tucker's fight, when the user gives it) | arena (60-69) |

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
| logride | FRX+53000 .. FRX+62000 (9000) | 9000 (a ride: by time) | ~2 min |
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
`TuckerPose`); `wounds` (`TuckerWounds`: `eye`, `saw`, `branch`, booleans) STACK: each job that mutilates him adds its
wound's drawing to the figure (stubbed now: only the clean state is drawn). `drawTuckerCloseup(c, cx, cy, scale,
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
- **The woodchipper** (logride -> woods), **the bike** (woods -> dirtbike), **the
  catch-up** (dirtbike -> arena): one-way cuts; give each a way back on foot.

## Things that outlive a death

`state.stage` is rebuilt on every death. What has to outlive one lives in its own module, keyed by `landVisit()`
(section.ts), which index.ts bumps only on a fresh way into the land. What has to outlive the visit (the station scene
done: `STATION_MEMO` in state.stageMemo) goes in stageMemo.
