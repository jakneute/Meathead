# Foreign Lands: who owns what

The design and the standing rules: `foreign-spec.md` (in this folder: the user's design verbatim, the fill-ins, the
standing rules, and job 1's decisions). Hollywood's `hollywood-spec.md` "Standing rules" apply in full. Each section's
index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Folders | Sections (checkpoint numbers) | State |
|---|---|---|
| `mexico/`, `norway/`, `china/`, `germany/`, `italy/` | 0-9, 10-19, 20-29, 30-39, 40-49 | built (job 1, first pass) |
| `japan/`, `morocco/`, `france/`, `uk/`, `canada/` | 50-59, 60-69, 70-79, 80-89, 90-99 | built (job 2, first pass) |
| `theater/` (CULTURES OF THE WORLD, the sub-boss) | 100-109 | stub: its front, the refill, its doors |
| `heli/` (boarding, the jacking, the shooter) | 110-119 | stub: the helipad |
| `harry/` (HELICOPTER HARRY, the land boss) | 120-129 | stub: the arena + a temporary walk-past win |

Inside your folders, anything goes (layout.ts, art.ts, kinds.ts, lines.ts...). Number checkpoints only inside your
range. Your lines go in your folder's `lines.ts` `VOICE_LINES` (by voice id); new voice ids go in
`tools/voices/cast.json` (append). Cast kinds are `m2:fl_<name>` on cast.ts's `castKind`; every new hurt source gets
hurt + death lines (`registerHurts` in your kinds.ts).

## Length budget (the user: about as long as Hollywood; the streets and the helicopter about half each)

Meathead walks ~210 px/s; "played" times assume fighting and platforming (about 2.5x pure walking). Count climbs by
playtime, not x width.

| Section | x range (world) | Target playtime |
|---|---|---|
| mexico | FLX+0 .. FLX+4200 | ~0.8 min |
| norway | FLX+4200 .. FLX+8000 | ~0.8 min |
| china | FLX+8000 .. FLX+13200 (the wall climbs to 1480 up) | ~1.3 min |
| germany | FLX+13200 .. FLX+17000 | ~0.8 min |
| italy | FLX+17000 .. FLX+21000 | ~0.8 min |
| japan, morocco, france, uk, canada | 3600 each, FLX+21000 .. FLX+39000 | ~0.7 min each |
| theater | FLX+39000 .. FLX+42000 | the sub-boss |
| heli | FLX+45000 .. FLX+48000 (the shooter auto-scrolls: count it by time) | ~7 min |
| harry | FLX+52000 .. FLX+55000 | the boss fight |

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

- The streets: walked, Mexico -> Canada -> the theater's front.
- Theater -> helipad: its doors (for now its right end, `endExits`) to `DOORS.heli.start`; back from the helipad's
  left end to `DOORS.theater.end`. The theater's owner puts the show between, then the exit to the helipad.
- Helipad -> Harry: Harry's rocket and the crash (for now the helipad's right end) to `DOORS.harry.start`; back by the
  arena's left end. Keep a way back working (revisits).
