# Space Land: who owns what

The design and the standing rules: the spec the skeleton was built from (space-spec.md, given to every agent). Each
section's index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Agent | Folders | Sections (checkpoint numbers) |
|---|---|---|
| Outdoors | `square/`, `drag/` | square (0-9), drag (30-39) |
| Atom | `atom/`, `ride/` | atom (10-19), ride (20-29) |
| Needle | `needle/` | needle (40-49) |
| Shooter | `orbit/` | orbit (50-59) |
| Haunted house | `crater/`, `queen/` | crater (60-69), queen (70-79) |

Inside your folders, anything goes: split into layout.ts, art.ts, people.ts, kinds.ts and so on, as Adventure Land's
and Spooky Land's sections do. Number your checkpoints only inside your range (they're numbered across the whole land
and sorted; the CHECKPOINT SKIP cheat lists them all). Each stub has one checkpoint at its start; keep it (or move
it) and add more. Your lines go in your folder's `lines.ts` `VOICE_LINES` (by voice id).

## Length budget (the user: every land about as long to play as Adventure Land)

Adventure Land's sections add up to ~76500 world px of play, plus its cutscenes and the boss. Count rides, the
shooter and vertical parts by how long they take to play, not by their x width. Meathead walks ~210 px/s; "played"
times assume fighting and platforming on the way (about 2.5x pure walking). Build to your target and report your
section's length and estimated playtime.

| Section | x range now (world) | Target (px of play) | Target playtime (excl. cutscenes) |
|---|---|---|---|
| square | SPX+0 .. SPX+10000 (10000 wide) | 10000 | ~2 min |
| atom | SPX+13000 .. SPX+20500 (7500) | 7500 | ~1.5 min |
| ride | SPX+23500 .. SPX+37500 (14000) | 14000 riding | ~2.5 min (plus the PA's 1990 future) |
| drag | SPX+40500 .. SPX+48000 (7500) | 7500 | ~1.5 min |
| needle | SPX+51000 .. SPX+55000 (4000) | ~4000 (mostly the cylinder) | ~1 min |
| orbit | SPX+58000 .. SPX+78000 (20000) | ~20000 scrolling | ~3 min + the UFO fight |
| crater | SPX+81000 .. SPX+93500 (12500) | 12500 (impact site + haunted house) | ~2.5 min |
| queen | SPX+96500 .. SPX+99500 (3000) | 3000 (the arena) | the boss fight |
| **total** | | **~78500** | **~14 min + cutscenes + two fights** |

SPX = 300000. Need more x room? Widen your x1 into the gap after it (re-read geometry.ts first); the gaps are 3000.

## Shared files (the skeleton's owner's)

- `index.ts` (the stage: routing, camera, checkpoints, grace, portal arrival, the flight bookkeeping, HUD zone)
- `geometry.ts` (SECTIONS x ranges, SECTION_ORDER, DOORS: the arrival points between sections)
- `section.ts` (SpaceSection, Flight, spaceState, spaceFlight, the crude exits/ground/sign/backdrop helpers;
  re-exports adventure/section.ts)
- `voices.ts` (SPACE_VOICE_LINES: gathers every section's lines.ts)

Section owners may only **append minimally** to these (e.g. widen your own section's x1 into the gap after it, move
your own DOORS entry, add a new lines file to voices.ts, extend Flight), and must **re-read the file right before
editing**: others are editing in parallel. Never reformat or reorder them. Outside src/m2/space, shared engine/M2
files (App.tsx, hudThemes.tsx, kinds.ts, roster.ts, tools/voices/cast.json, the engine's player code...) are the same:
re-read, append minimally.

## How sections connect (crude, for now)

Each section's ends have walls; walking into its right end puts him at the next section's `DOORS[next].start`, its left
end at the previous one's `DOORS[prev].end` (`endExits(id)` + `runExits`, in each section's update). Replace your own
with the real thing (the atom's doors, the train, the launch, the needle's lift, the window, the crash...) and move
your DOORS entries to match; keep the way back working (revisits), or give a one-way set piece a sane way to return.

## Free flight (orbit/ only)

`SpaceSection.flight(state)` returns a `Flight` (section.ts) while he's flying, null on foot. While it's on, the stage
(index.ts) sets `player.noSpecials` and the UI's `noSwitch` (ray gun only, no switching) and keeps it on the stage
(`spaceFlight(state)` for anything outside the section). Controls pass through as everywhere: the section's update
gets the raw controls and returns what the engine gets. The flying itself (no gravity, free movement, facing right
only, rapid fire) is the orbit owner's to build, with whatever engine hook it needs (append minimally).

## The land's end

`queen/` holds the skeleton's stand-in: past the middle of the room it's VICTORY, the walk-away (`walkAway/spaceQueen.ts`,
a placeholder SceneDef registered as `'space-queen'` in walkAway.ts) and the hub, Space Land cleared. The portal walk in
is `walkAway/intoSpace.ts` (crude; the square's owner may bring the square's painting into it).
