# Foreign Lands: who owns what

The design and the standing rules: `foreign-spec.md` (in this folder: the user's design verbatim, the fill-ins, the
standing rules, and job 1's decisions). Hollywood's `hollywood-spec.md` "Standing rules" apply in full. Each section's
index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Folders | Sections (checkpoint numbers) | State |
|---|---|---|
| `mexico/`, `norway/`, `china/`, `germany/`, `italy/` | 0-9, 10-19, 20-29, 30-39, 40-49 | built (job 1, first pass) |
| `japan/`, `morocco/`, `france/`, `uk/`, `canada/` | 50-59, 60-69, 70-79, 80-89, 90-99 | built (job 2, first pass) |
| ~~`theater/`~~ (CULTURES OF THE WORLD) | ~~100-109~~ | AXED (the user, 2026-10-16): removed |
| `heli/` (the helipad off the end of Canada, boarding, the jacking, the shooter) | 110-119 | built (job 4, first pass) |
| `harry/` (HELICOPTER HARRY, the land boss) | 120-129 | stub: the arena + a temporary walk-past win |

Inside your folders, anything goes (layout.ts, art.ts, kinds.ts, lines.ts...). Number checkpoints only inside your
range. Your lines go in your folder's `lines.ts` `VOICE_LINES` (by voice id); new voice ids go in
`tools/voices/cast.json` (append). Cast kinds are `m2:fl_<name>` on cast.ts's `castKind`; every new hurt source gets
hurt + death lines (`registerHurts` in your kinds.ts).

## Length budget (the user: about as long as Hollywood; the streets and the helicopter about half each)

Meathead walks ~210 px/s; "played" times assume fighting and platforming (about 2.5x pure walking). Count climbs by
playtime, not x width.

The land is TWO long sequences (the user's): the pavilions (one continuous walk) and the helicopter, about as long to
play as each other. Job 4b lengthened every pavilion ~50% (each one's old stretch kept as it was; the new stretch on
its far end, in its own file: mexico/cliff.ts, norway/toll.ts, china/ridge.ts, germany/brewery.ts, italy/oven.ts,
japan/station.ts, morocco/souk.ts, france/louvre.ts, uk/clocktower.ts, canada/pond.ts).

| Section | x range (world) | Target playtime |
|---|---|---|
| mexico | FLX+0 .. FLX+6200 (La Quebrada's cliff from +4200) | ~1.2 min |
| norway | FLX+6200 .. FLX+11800 (the troll toll bridge from +3800) | ~1.2 min |
| china | FLX+11800 .. FLX+19400 (the wall climbs to 1120, then the second ridge and the beacon tower to 1720) | ~2 min |
| germany | FLX+19400 .. FLX+25000 (the brewery hill from +3800) | ~1.2 min |
| italy | FLX+25000 .. FLX+30800 (il forno and the rooftops from +4000) | ~1.2 min |
| japan | FLX+30800 .. FLX+36200 (the bullet train from +3600) | ~1.1 min |
| morocco | FLX+36200 .. FLX+41600 (the souk's stampede from +3600) | ~1.1 min |
| france | FLX+41600 .. FLX+47000 (the Louvre's pyramid from +3600) | ~1.1 min |
| uk | FLX+47000 .. FLX+52400 (Big Benjamin from +3600) | ~1.2 min |
| canada | FLX+52400 .. FLX+57800 (the frozen pond and the toboggan hill from +3600) | ~1.1 min |
| heli | FLX+57800 .. FLX+60800 (on the end of the streets; the shooter's one fixed screen high over it: count it by time) | ~10 min (matches the pavilions, ~12 min) |
| harry | FLX+71000 .. FLX+74000 | the boss fight |

Checkpoints inside the longer pavilions keep each one's tens: Mexico 3-4, Norway 13-14, China 24-26, Germany 33-34,
Italy 44-45, Japan 54-55, Morocco 64-65, France 74-75, UK 84-85, Canada 94-95.

FLX = 600000. **The streets are one continuous walk: no gaps between street sections.** Need more room in a pavilion?
Grow it UP (-y), or move every later street section on together (and their DOORS). The cut sections have gaps.

## Shared files (the skeleton's)

- `index.ts` (the stage: routing, the streets' camera, checkpoints, grace, portal arrival, the shared shots/barks/PA)
- `geometry.ts` (SECTIONS, SECTION_ORDER, STREETS, DOORS), `section.ts` (ForeignSection, foreignState, landVisit,
  endExits/endWalls/runExits; re-exports adventure/section.ts and Hollywood's crude helpers)
- `state.ts` (the streets' shared state: the PA, barks, gags), `pavilion.ts` (the PA hello / arrival / gags, hurt
  lines, pavilionVoices), `cast.ts` (the costume drawer + the fighting AI: castKind, spawnCast), `shots.ts`,
  `backdrop.ts`, `kit.ts` (the painting kit over hollywood/blvd/kit.ts; LOOKS), `movers.ts`, `water.ts`, `stub.ts`,
  `lines.ts`, `voices.ts` (FOREIGN_VOICE_LINES: gathers every section's lines.ts)

Section owners may only **append minimally** to these (a ShotKind, a LOOKS entry, a kit helper) and must **re-read the
file right before editing**. Never reformat or reorder them. Outside src/m2/foreign (App.tsx, hudThemes.tsx, kinds.ts,
tools/voices/cast.json, the engine) the same: re-read, append minimally.

## How sections connect

- The streets: walked, Mexico -> Canada -> the helipad (heli is a street section: no cut, no walls between).
- Helipad -> Harry: Harry's rocket and the crash (for now the helipad's right end) to `DOORS.harry.start`; back by the
  arena's left end. Keep a way back working (revisits).
