# Cartoon Land: who owns what

The design and the standing rules: `cartoon-spec.md` (in this folder; given to every agent: the user's brief verbatim,
the fill-ins, the rules, the section plan). Each section's index.ts header says what goes in it.

## Section owners (one agent each; edit only your own folders)

| Job | Folders | Sections (checkpoint numbers) |
|---|---|---|
| 1 (done) | the skeleton; `kiddie/`, `sway.ts`, `monument.ts` | kiddie (0-9: 0-5 used) |
| 2 (done) | `studio/` | studio (10-19: 10-15 used) |
| 3 (done) | `whitehouse1/` (the transformation, Chelsea, the pundits, the cat's death and the puffs live there); the engine's cat form (`m1/game/render/player/catBody.ts`) and cartoon kills (`m1/game/core/cartoonKills.ts`) | whitehouse1 (20-29: 20-26 used) |
| 4 | `whitehouse2/` | whitehouse2 (30-39) |
| 5 | `bigkid/` | bigkid (40-49) |
| 6 | `itchy/` | itchy (50-59) |
| 7 | `amphi/` (and walkAway/stupidDad.ts made real) | amphi (60-69) |

Inside your folders, anything goes: split into layout.ts, art.ts, kinds.ts and so on, as `kiddie/` does. Number your
checkpoints only inside your range (they're numbered across the whole land and sorted; the CHECKPOINT SKIP cheat lists
them all). Each stub has one checkpoint at its start; keep it (or move it) and add more. Your lines go in your folder's
`lines.ts` `VOICE_LINES` (by voice id; voices.ts gathers them, so they're recorded and never weeded out). Your kinds are
`m2:ct_*` (all new: no other land's kinds in Cartoon Land).

## Length budget (the user: every land about as long to play as Jungle Land, ~76500 px of play)

| Section | x range now (world) | Target (px of play) | Target playtime (excl. cutscenes) |
|---|---|---|---|
| kiddie | CTX+0 .. CTX+14000 | ~14000 (the towers counted by play) | ~3.5 min |
| studio | CTX+17000 .. CTX+27000 | ~10000 | ~2 min |
| whitehouse1 | CTX+30000 .. CTX+42000 | ~12000 (two mini-bosses) | ~3 min |
| whitehouse2 | CTX+45000 .. CTX+57000 | ~12000 (three mini-bosses) | ~3.5 min |
| bigkid | CTX+60000 .. CTX+72000 | ~12000 | ~2.5 min |
| itchy | CTX+75000 .. CTX+85000 | ~10000 | ~2 min |
| amphi | CTX+88000 .. CTX+92000 | the guard, the boss | the fight |

CTX = 900000. Need more x room? Widen your x1 into the gap after it (re-read geometry.ts first); the gaps are 3000.

## Shared files (the skeleton's owner's)

- `index.ts` (the stage: routing, camera, checkpoints, grace, portal arrival, the HUD zone)
- `geometry.ts` (SECTIONS x ranges, SECTION_ORDER, DOORS)
- `section.ts` (CartoonSection, cartoonState, landVisit, byPants/pantsOf, the crude exits/walls; re-exports
  adventure/section.ts and Hollywood's crude drawing helpers)
- `kit.ts` (the painting kit: toonSign, toonLetters, toonSky, puffTree, wobblePath, stripes, inked, hour / dimmed / lit)
- `monument.ts` (THE CARTOON LAND WATER TOWER: MONUMENT_AT per section, drawMonument, drawTowerAt)
- `sway.ts` (THE SWAYING STACK-TOWERS: makeTowers, updateTowers, drawTowers, towerTop, onTower, ridingTower)
- `talk.ts` (ByPants, HurtTable: pure data, node-safe), `lines.ts` (land-wide lines: RIDE_SNOB)
- `stub.ts` (the stand-in sections), `voices.ts` (CARTOON_VOICE_LINES: gathers every section's lines.ts)

Section owners may only **append minimally** to these, and must **re-read the file right before editing**. Never
reformat or reorder them. Outside src/m2/cartoon, shared engine/M2 files (App.tsx, hudThemes.tsx, kinds.ts,
tools/voices/cast.json, the engine's player code...) are the same: re-read, append minimally.

## How sections connect

Each stub's ends have walls; walking into its right end puts him at the next section's `DOORS[next].start`, its left
end at the previous one's `DOORS[prev].end` (`endExits(id)` + `runExits`). Replace your own with the real thing and
move your DOORS entries to match; keep the way back working (revisits), or give a one-way set piece a sane way back:

- **Sillyville Square -> the studio** (built, kiddie/): walk into the studio's front door (STUDIO.door) and he's at
  `DOORS.studio.start` (`ct-kiddie-done` in state.stageMemo: been through it; a later arrival's line is the revisit's).
  Back from the studio's left end: `DOORS.kiddie.end` (in front of that door).
- **The studio -> the White House** (built, studio/): in behind THE SCREEN at the studio's end (past studio x 9880),
  to `DOORS.whitehouse1.start` (`ct-studio-done` in state.stageMemo: the tour's done; a later visit is the revisit).
  The user's: "you enter behind a screen" (the transformation scene is job 3's: he arrives at whitehouse1's start as
  himself). Back from the White House's left end: `DOORS.studio.end` (in front of the screen). Back out of the
  studio's left end (the lobby's front doors): `DOORS.kiddie.end`.
- **The studio -> the White House** (built both sides): the transformation at whitehouse1's start the first time; back
  out its left end to `DOORS.studio.end` (himself again out there); in again, a scribble back into the cat.
- **The White House, part one -> part two** (part one built, whitehouse1/): walk off the West Colonnade at the garden's
  right end to `DOORS.whitehouse2.start`; back from part two, `DOORS.whitehouse1.end` (in the garden).
- **The White House, part two -> the big-kid rides** (stub): the right end. The user's: "meathead then leaves the
  cartoon studio" (after the projector's collapse and the bodies).
- **The big-kid rides -> the knockoff area -> the amphitheater** (stubs): the right ends.
- **The amphitheater -> the hub** (stand-in, amphi/): walk past the guard: VICTORY, the walk-away
  (walkAway/stupidDad.ts, the MALLET), markLandCleared('cartoon'), the hub.

## Job 3's appends outside src/m2/cartoon (for whoever touches them next)

- Player.catForm, Enemy.poofed, Projectile.isHairball (m1/types.ts); GameState.cartoonKills (core/state.ts, cleared with
  the stage); the sounds `hairball`, `hairsplat`, `poof`, `scratch` (platform/sfx.ts).
- The cat: render/player/catBody.ts (new); body.ts's drawArm / drawLeg / drawHead / drawTorsoFromHips hand over to it while
  it's on (setCatBody, set at the top of drawPlayer); drawPlayer's own branch for it; player/deathAnim.ts startCatDeath
  (called from player/player.ts killPlayer); combat/weapons.ts (the GUN's hairball), combat/muzzle.ts (catMouthPoint),
  combat/projectiles.ts (its droop, splat, kill line), render/projectiles.ts (drawHairball); moves/grab.ts (claws and the
  scratch in the beatdown); moves/killLines.ts (`hairball_kill`); App.tsx + store.ts (`catHud`: HAIRBALL on the HUD).
- Cartoon kills: core/cartoonKills.ts (new); core/effects.ts, enemies/deaths.ts, enemies/enemies.ts, render/world.ts,
  core/update.ts; weapons/goreSlide.ts, spawner.ts, crossbow.ts, soulSucker.ts, stuntCar.ts.
- Shared here: index.ts (clears catForm / cartoonKills each frame before the section's update; `catHud`).
- tools/voices/cast.json: m2.cartoon.chelsea, perot, falwell, goon(f), lobbyist(f), pollster(f).

## Things that outlive a death

(The studio's memos: `ct-studio-lit` (which rooms' lights are on, a bit each) and `ct-studio-done`; its narrator's
stories and Meathead's gags are once a visit, keyed by `landVisit()` in studio/pa.ts and studio/state.ts.)

`state.stage` is rebuilt on every death. What has to outlive one lives in its own module, keyed by `landVisit()`
(section.ts), which index.ts bumps only on a fresh way into the land (kiddie/state.ts's saidOnce: what he's said this
visit). What has to outlive the visit goes in state.stageMemo.
