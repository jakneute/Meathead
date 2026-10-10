# Spooky Land: who owns what

The design and the standing rules: the spec the skeleton was built from (spooky-spec.md, given to every agent). Each
section's index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Agent | Folders | Sections (checkpoint numbers) |
|---|---|---|
| Town | `town/` | town (0-9) |
| Castle + dungeon | `castle/`, `dungeon/` | castle (10-19), dungeon (20-29) |
| Tower | `tower/` | tower (40-49) |
| Hell | `hell/` | hell (50-59) |
| Control + ballroom | `control/`, `ballroom/` | control (60-69), ballroom (70-79) |

Inside your folders, anything goes: split into layout.ts, art.ts, people.ts, kinds.ts and so on, as Adventure Land's
sections do. Number your checkpoints only inside your range (they're numbered across the whole land and sorted; the
CHECKPOINT SKIP cheat lists them all). Your lines go in your folder's `lines.ts` `VOICE_LINES` (by voice id).

## Length budget (the user: every land about as long to play as Adventure Land)

Adventure Land's sections add up to ~64500 world px (jungle 12000, queue 2000, river 14000 swimming, dino 12000,
temple 6000, mine cart 12000 riding, roof 2500, clearing 4000), plus its cutscenes and the boss. Spooky Land's shares
add up to about the same. Count vertical parts by how long they take to play, not by their x width. Meathead walks
~210 px/s; "played" times assume fighting and platforming on the way (about 2.5x pure walking). Build to your target
and report your section's length and estimated playtime.

| Section | x range now (world) | Target (px of play) | Target playtime (excl. cutscenes) |
|---|---|---|---|
| town | SX+0 .. SX+12000 (12000 wide) | 12000 | ~2.5 min |
| castle | SX+14000 .. SX+26000 (12000) | 12000 | ~2.5 min (plus the PA's tour stories) |
| dungeon | SX+28000 .. SX+31000 (3000) | 3000 | ~40 s |
| tower | SX+42000 .. SX+47000 (5000 wide) | ~9000 equivalent: the loading bay (~1500) + the climb (the bulk; ~2400+ px up, beams on the way) | ~2 min |
| hell | SX+49000 .. SX+60000 (11000) | 11000 incl. the demon arena | ~2.5 min + the demon fight |
| control | SX+63000 .. SX+68000 (5000) | 5000 (control room + gift shop chase) | ~1 min + the reveal |
| ballroom | SX+71000 .. SX+74000 (3000) | 3000 (the arena) | the boss fight |
| **total** | | **~63000** | **~13 min + cutscenes + two fights** |

SX = 200000. Need more x room? Widen your x1 into the gap after it (re-read geometry.ts first); the gaps are 2000-3000.

## Shared files (the skeleton's owner's)

- `index.ts` (the stage: routing, camera, checkpoints, grace, portal arrival, HUD zone)
- `geometry.ts` (SECTIONS x ranges, SECTION_ORDER, DOORS: the arrival points between sections)
- `section.ts` (SpookySection, spookyState, the crude exits/ground/sign helpers; re-exports adventure/section.ts)
- `voices.ts` (SPOOKY_VOICE_LINES: gathers every section's lines.ts)

Section owners may only **append minimally** to these (e.g. widen your own section's x1 into the gap after it, move
your own DOORS entry, add a new lines file to voices.ts), and must **re-read the file right before editing**: others
are editing in parallel. Never reformat or reorder them. Outside src/m2/spooky, shared engine/M2 files (App.tsx,
hudThemes.tsx, kinds.ts, roster.ts, tools/voices/cast.json...) are the same: re-read, append minimally.

## How sections connect (crude, for now)

Each section's ends have walls; walking into its right end puts him at the next section's `DOORS[next].start`, its left
end at the previous one's `DOORS[prev].end` (`endExits(id)` + `runExits`, in each section's update). Replace your own
with the real thing (the stairs, the drop into hell, the geyser...) and move your DOORS entries to match; keep the way
back working (revisits).
