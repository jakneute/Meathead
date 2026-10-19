# Fairy Land: who owns what

The design and the standing rules: `fantasy-spec.md` (in this folder; given to every agent: the user's brief verbatim,
the fill-ins, the rules, the section plan). Each section's index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Job | Folders | Sections (checkpoint numbers) |
|---|---|---|
| 1 (done) | the skeleton; `square/`, `stairs.ts`, `monument.ts`, `piper.ts` | square (0-9) |
| 2 (done) | `wheel/` (and suitors.ts's tee / knight / wizard kits, ui.qte in store.ts, QtePanel in App.tsx) | wheel (10-19: 10-12 used) |
| 3 (done) | `glen/` (and square/hazards.ts's updateThrows / drawThrows exported for the square's kinds in the glen) | glen (20-29: 20-26 used) |
| 4 (done) | `tragons/` (and store.ts's carHops / requestCarHop / tragonTips, App.tsx's wheel and LB / RB hop routing and the controls card) | tragons (30-39: 30-38 used) |
| 5 | `keep/` | keep (40-49) |
| 6 | `broom/` | broom (50-59) |
| 7 | `bedroom/` (Piper's fight: when the user gives its mechanics; piper.ts's poses as it needs) | bedroom (60-69) |

Inside your folders, anything goes: split into layout.ts, art.ts, kinds.ts and so on, as `square/` does. Number your
checkpoints only inside your range (they're numbered across the whole land and sorted; the CHECKPOINT SKIP cheat lists
them all). Each stub has one checkpoint at its start; keep it (or move it) and add more. Your lines go in your folder's
`lines.ts` `VOICE_LINES` (by voice id; voices.ts gathers them, so they're recorded and never weeded out).

## Length budget (the user: every land about as long to play as Jungle Land, ~76500 px of play)

| Section | x range now (world) | Target (px of play) | Target playtime (excl. cutscenes) |
|---|---|---|---|
| square | FAX+0 .. FAX+15000 | ~15000 (the staircases and the tower counted by play) | ~3.5 min |
| wheel | FAX+18000 .. FAX+24000 | by time: the suitors, the QTEs | ~2.5 min |
| glen | FAX+27000 .. FAX+41000 | ~14000 | ~3 min |
| tragons | FAX+44000 .. FAX+58000 | a ride: by time | ~2.5 min |
| keep | FAX+61000 .. FAX+73000 | ~12000 | ~2.5 min |
| broom | FAX+76000 .. FAX+80000 | its own view: by time | ~2 min |
| bedroom | FAX+83000 .. FAX+87000 | the reveal + the boss | the fight |

FAX = 800000. Need more x room? Widen your x1 into the gap after it (re-read geometry.ts first); the gaps are 3000.

## Shared files (the skeleton's owner's)

- `index.ts` (the stage: routing, camera, checkpoints, grace, portal arrival, the HUD zone)
- `geometry.ts` (SECTIONS x ranges, SECTION_ORDER, DOORS)
- `section.ts` (FantasySection, fantasyState, landVisit, byPants/pantsOf, the crude exits/walls; re-exports
  adventure/section.ts and Hollywood's crude drawing helpers)
- `kit.ts` (the crude painting kit: storySign, fairySky, gilt / painted letters)
- `monument.ts` (THE GREAT PIXIE'S CASTLE: MONUMENT_AT per section, drawMonument, drawCastleAt, PIPER_WINDOW)
- `stairs.ts` (THE ENCHANTED STAIRCASES: makeStairs, updateStairs, drawStairs, stairEnd, onStair, ridingAny)
- `talk.ts` (ByPants, HurtTable, PIPER_VOICE: pure data, node-safe), `lines.ts` (land-wide lines: HORNY, Piper's PA voice)
- `stub.ts` (the stand-in sections), `voices.ts` (FANTASY_VOICE_LINES: gathers every section's lines.ts)
- `suitors.ts` (the beefy suitors, drawn: everybody draws them from here; the trials' rivals)
- `piper.ts` (PIPER THE PIXIE, drawn at full detail: everybody draws her from here)

Section owners may only **append minimally** to these, and must **re-read the file right before editing**. Never
reformat or reorder them. Outside src/m2/fantasy, shared engine/M2 files (App.tsx, hudThemes.tsx, kinds.ts,
tools/voices/cast.json, the engine's player code...) are the same: re-read, append minimally.

## How sections connect

Each stub's ends have walls; walking into its right end puts him at the next section's `DOORS[next].start`, its left
end at the previous one's `DOORS[prev].end` (`endExits(id)` + `runExits`). Replace your own with the real thing and
move your DOORS entries to match; keep the way back working (revisits), or give a one-way set piece a sane way back:

- **The loudspeaker -> the fairy wheel** (built, square/speaker.ts): the scene ends in black with him at
  `DOORS.wheel.start` (SPEAKER_MEMO in state.stageMemo: done for good). Back from the wheel's left end:
  `DOORS.square.end` (by the bandstand); on a revisit the square's right end walks on to the wheel.
- **The fairy wheel -> the glen** (built, wheel/): walk past the plaza's gate and the trial's on (both gates shut); all
  the suitors dead, the far gate opens and its right end walks on to `DOORS.glen.start`; the gate back stays shut the
  rest of that visit (WHEEL_MEMO in state.stageMemo: won for good; a later visit's wheel is empty and open both ways).
  Back from the glen: `DOORS.wheel.end` (past the far gate).
- **The glen -> Truelling Tragons** (built, glen/): the queue at the glen's end; the ride's door is its right end, on
  to `DOORS.tragons.start`; back from the ride: `DOORS.glen.end` (in front of the queue). The rivals who go in ahead of
  him (BLAKE, RAFAEL, HANK) are glen/rivals.ts's RIVALS (SuitorLooks with their voices): the ride's to put in its cars.
- **Truelling Tragons -> the castle's base** (built, tragons/): aboard the ICE dragon at the load station and it goes
  (one-way); pulled in at the unload (DONE_MEMO in state.stageMemo), off the decks and out the castle's gate arch past
  them (EXIT_X) to `DOORS.keep.start`. Back from the castle's base: `DOORS.tragons.end` (in front of that arch). A
  revisit (done): no dragons running, walk the ground between the unload and the station; its left end back to the glen.
  Which rivals died on the ride: `fa-rival-dead-<blake|rafael|hank>` in state.stageMemo (the brooms can leave them out).

## Things that outlive a death

`state.stage` is rebuilt on every death. What has to outlive one lives in its own module, keyed by `landVisit()`
(section.ts), which index.ts bumps only on a fresh way into the land. What has to outlive the visit (the loudspeaker's
scene done) goes in state.stageMemo.
