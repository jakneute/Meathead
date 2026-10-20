# Meathead 2: maintainer's handoff

Written 2026-10-20 for maintaining the game without an AI assistant. Line numbers drift as files change: when one
is off, search for the constant's name instead (VS Code: Ctrl+Shift+F).

---

## 1. Build and test

### npm scripts (package.json)

| Command | What it does |
|---|---|
| `npm install` | Once, after a fresh clone. |
| `npm run lint` | `tsc --noEmit`: the type check. Run it after every edit. It catches most typos. |
| `npm run release:m2` | Builds both single-file pages: `release-m2/Meathead2.html` (the standard game, no cheats) and `release-m2/Meathead2-cheats.html` (the same with the CHEATS panel in the pause menu). Open either one straight in a browser. These files aren't tracked in git, so rebuild after every change. |
| `npm run dev` | The Vite dev server, with hot reload. M2 lives at `http://localhost:5173/meathead2.html`. The dev URL params below only work here. |
| `npm run voices` | Re-records new or changed voice lines and repacks them (see below). |
| `npm run voices:m2` | Only repacks M2's voice pack out of the big one, with no recording. `npm run voices` already runs it. |
| `npm run release:m1`, `release:steam` | Meathead 1's builds. |

### Voices pipeline (tools/voices/, README.md there)

- Setup, once: the Python venv and the Kokoro model files (`kokoro-v1.0.onnx`, `voices-v1.0.bin`). The steps are in
  `tools/voices/README.md`, and they're already done on this PC.
- `npm run voices` does this: `extract.ts` finds every line in the code and writes `manifest.json` (`extras.json`
  holds lines built at runtime), `generate.py` records the new or changed lines (everything else comes from
  `cache/`), then `m2pack.ts` packs M2's lines and `m1pack.cjs` packs M1's. Then run `npm run release:m2`.
- `cast.json` maps each speaker id to a voice: a Kokoro voice or a blend, `speed`, playback `rate` (under 1 is
  deeper), `gain`, `fx` (radio, mask, wet, chorus, announcer, doom) and `alias`. If you change someone's voice, only
  their lines get re-recorded.
- `pronunciations.json` fixes mispronounced words. Each fix is `{ in: "<bit of a line>", say: "<sound-alike
  spelling>" }`, and only lines containing that bit are affected.
- `unresolved.txt` lists the spots where the extractor couldn't work out the text (template strings, computed
  names). Lines there **are not recorded**, so they show as text only. If a new line of yours lands in it, write it as
  a plain string literal in a `VOICE_LINES` / `*_LINES` array. Most of the ~315 entries are known and harmless.
- In the browser console, `window.__voiceMisses` lists the lines that played without a recording.
- M2 lines are picked up through each land's `voices.ts` (for example `src/m2/fantasy/voices.ts`, which gathers that
  land's `lines.ts` `VOICE_LINES`), and `m2pack.ts` imports all of them. A new land-specific line goes in that
  land's `lines.ts`.

### Dev URL params (dev server only: `import.meta.env.DEV`)

| Param | Effect | Where it's read |
|---|---|---|
| `?adv=N`, `?spooky=N`, `?space=N`, `?hollywood=N`, `?foreign=N`, `?frontier=N`, `?fantasy=N`, `?cartoon=N` | Starts that land at checkpoint N. Jungle Land is `adv`, Future Land is `space`, Wilderness Land is `frontier`, Fairy Land is `fantasy`. | each land's `index.ts`, about line 70-96 |
| `?hub=N` | Starts at the hub, standing at spot N (7 = Jungle Land's portal). | App.tsx:138 |
| `?walkaway=artie` (also `donnie`, `queen`, `steve`, `harry`, `tucker`, `piper`, `dad`) plus `&weak`, `&shat`, `&nude`, `&weapon=MALLET` | Loops the post-boss walk-away on its own. | walkAway.ts:342 |
| `?portal=<land id>` plus `&shat`, `&nude`, `&weapon=` | Loops the walk into a land. | portalWalk.ts:203 |
| `?tod=` | Forces the time of day. | timeOfDay.ts:42 |
| `?pen` | Starts in the staff room. | App.tsx:207 |
| `?zone=<theme>` | Forces a HUD theme. | App.tsx:514 |

Any land or hub param skips the title screen. The land params map to their checkpoint lists in `LAND_STAGES`
(App.tsx:175-184). In the cheats build, CHECKPOINT SKIP works from the hub: walk into an open portal and a checkpoint
picker appears (hub/index.ts:111, App.tsx:700).

### The cheats build (Meathead2-cheats.html: pause, then CHEATS; PauseMenu.tsx:40-55)

- GOD MODE (also unlimited air underwater), UNLIMITED AMMO, ALL WEAPONS.
- CHECKPOINT SKIP: lists every checkpoint of the land, so you can jump to any of them. A checkpoint restores the
  world state that goes with it.
- PANTS (normal / shitty / naked) to test the three line pools.
- TIME OF DAY: 0-9 (= lands cleared), or AUTO.
- SOUND TEST: `<` `>` steps through every song and arrangement, and STOP stops it (`music/soundTest.ts`).
- The cheats build never writes save files.

### Save files (src/m2/save.ts)

- Three slots, stored as `meathead2-save-1`, `-2`, `-3`, plus the settings under `meathead2-settings`. Each slot holds
  the lands cleared (in order), what each cleared land keeps for revisits, the play time and the last-played date.
  The game saves only when a land is cleared or you arrive at the hub, never mid-land.
- To clear them in a browser: F12, Application, Local Storage, the file:// origin, then delete the
  `meathead2-save-N` keys. You can also run `localStorage.removeItem('meathead2-save-1')` in the console. In the
  desktop build the slots are real files (m1 `save/storage.ts`).
- An unreadable or newer-version slot just reads as empty, so the game never crashes on a bad save.

### Git hygiene

- Commit with explicit paths, `git add src/m2/fantasy/bedroom/fight.ts docs/M2-HANDOFF.md`, never `git add -A`.
  The repo contains big generated and local files (voice cache, release pages).
- Run `npm run lint` before committing. Commit one fix per commit, with a plain message saying what changed.
- If something breaks, `git log --oneline -- <file>` shows what changed in that file, and
  `git show <hash>` shows the change. The old commit messages are very detailed: they're the best documentation of
  why something is the way it is.

---

## 2. Code map

### Lands (src/m2/<id>/; on-screen names differ for three of them)

| Folder | On screen | Sections (folders, in order) | Spec / ownership |
|---|---|---|---|
| `adventure/` | JUNGLE LAND | jungle (0-6), queue (10), river (20-24: the cruise and the swim), dino (30-34: T. rex sub-boss), temple (40-42), cart (50-56), roof (60), clearing (70-71: Safari Artie) | no spec; see the commit log |
| `spooky/` | SPOOKY LAND | town (0-3), castle (10-14), dungeon (20-23), tower (40-47), hell (50-53: the demon sub-boss), control (60-62), ballroom (Donnie Dracula) | `OWNERSHIP.md` |
| `space/` | FUTURE LAND | square (0-3), atom (10-14), ride (20-23), drag (30-33), needle (40-41), orbit (50-54: UFO sub-boss), crater (60-64), queen (70-73: Space Queen) | `OWNERSHIP.md` |
| `hollywood/` | HOLLYWOOD LAND | blvd (0-9), coaster (10-19: Thrones of the Stars), warehouse (20-29: the Ensemble Cast sub-boss at 25), lot (30-39), disaster (40-49), havoc (50-59), stunt (60: Stuntman Steve) | `hollywood-spec.md`, `OWNERSHIP.md` |
| `foreign/` | FOREIGN LANDS | mexico (0), norway (10), china (20), germany (30), italy (40), japan (50), morocco (60), france (70), uk (80), canada (90) pavilions; theater (100s, axed); heli (110-119: the mech shooter); harry (120: Helicopter Harry) | `foreign-spec.md`, `OWNERSHIP.md` |
| `frontier/` | WILDERNESS LAND | wilds (0-5), train (10-18), town (20-29: Sawdust Gulch and the mines), logride (30-38), woods (40-41), dirtbike (50-55: the Road Rash teens), arena (60-61: Tucker) | `frontier-spec.md`, `OWNERSHIP.md` |
| `fantasy/` | FAIRY LAND | square (0-5), wheel (10-12), glen (20-26), tragons (30-38), keep (40-46), broom (50-51), bedroom (60-61: Piper) | `fantasy-spec.md`, `OWNERSHIP.md` |
| `cartoon/` | CARTOON LAND | studio, whitehouse1, whitehouse2, bigkid, kiddie / itchy (Punchy & Kicky), amphi (Stupid Dad) | `cartoon-spec.md`, `OWNERSHIP.md` |

The numbers in brackets are each section's checkpoints. Each land's sections are listed in the `SECTIONS` object of its
`geometry.ts`.

- **`*-spec.md`** holds the land's brief (your words, verbatim), the fill-ins, the rules and a **decisions log**.
  Read it before changing a land.
- **`OWNERSHIP.md`** maps each job to its folders and **checkpoint number ranges** (each section owns a range of
  ten, e.g. Fairy Land's wheel is 10-19), and gives the length budget.
- Each land has: `index.ts` (wires the sections together, builds the checkpoint list and reads the dev param),
  `section.ts` (the section interface), `geometry.ts`, `voices.ts`, usually `lines.ts`, `kit.ts` (the SNES art
  helpers), and per-section `layout.ts` / `art.ts` / `kinds.ts` / `fight.ts` / `lines.ts`.

### Shared M2 modules (src/m2/)

| File | Role |
|---|---|
| `App.tsx` | Top level: the global M2 tuning (hurt scale, drops, melee damage; see section 3), the HUD per ride, the dev params, the screens. |
| `store.ts` | Shared UI/game state: progress, `clearedLands`, `keepForRevisits`, ride HUD values (`broomHud`, `carHops`...), `ui.pauseControls`, `ui.qte`. |
| `save.ts` | Save slots (above). |
| `PauseMenu.tsx` | Pause menu, OPTIONS, SKIP / BACK TO HUB, the CHEATS panel. |
| `PauseControls.tsx` | The controls card shown when paused in a ride section with no weapon switching. |
| `ControlsGuide.tsx` | The OPTIONS → CONTROLS pages (general controls only). |
| `ChordPrompt.tsx`, `hudKit.tsx`, `hudThemes.tsx`, `hudSkins/*.tsx` | Button prompts, the HUD building blocks, each land's HUD and pause-menu skin. |
| `walkAway.ts` + `walkAway/` | The post-boss walk-away screen (one file per boss, and `into*.ts` for land intros). |
| `portalWalk.ts`, `portalArrival.ts` | The walk from a hub portal into a land. |
| `victory.ts` | The VICTORY letters stamp and its jingle timing. |
| `bossQuiet.ts` | `markBossFight(state, name)`: every boss fight names itself (the music and quieting depend on it). |
| `timeOfDay.ts` | The sky and the hour, from lands cleared. |
| `deathText.ts` | Draws the death-screen text (48 px font over 720 px; shrinks, then wraps). |
| `kinds.ts`, `roster.ts` | M2 enemy kinds registered with the engine; `M2_ENEMY_KINDS` (which kinds' lines get packed). |
| `moves/` | `grab.ts` (beatdown / shakedown / air grab and the beatdown MOB), `callouts.ts`, `killLines.ts`, `ladders.ts`. |
| `weapons/` | M2 weapons: crossbow, flintlock, mallet, shield, soulSucker, spellbook, stuntCar, and so on. |
| `lines/` | Global lines: `weaponLines.ts`, `gutLines.ts`, `hubLines.ts`, `clean.ts`, `consistency.ts` (the Happyland word checks). |
| `hub/`, `intro/`, `pen/` (the staff room), `title/` (TitleScreen, FileSelect) | Non-land screens. |
| `music/` | **Read `music/MUSIC.md` (the system and the registry of every theme) and `music/MML.md` (how to write songs).** `engine.ts` is the synth, `cues.ts` decides what plays where, `songs/` holds the songs (`songs/title.ts` is the worked example). |
| `cast/`, `GoreBag.tsx`, `held.ts`, `drown.ts`, `hazardHit.ts`, `pathing.ts` | Shared characters, gore, held weapons, drowning, hazards hitting enemies, enemy pathing. |

### Shared engine (src/m1/)

| Where | What |
|---|---|
| `src/m1/constants.ts` | Core numbers: `INITIAL_PLAYER_HEALTH = 100` (line 94), `ENEMY_HIT_COOLDOWN = 60` (the boss breather, line 409), player speeds, jumps, power. |
| `src/m1/game/player/` | The player: movement, moves, `gut.ts` (shitty / naked state). |
| `src/m1/game/enemies/` | Enemy AI, `kinds`, collateral damage and mass. |
| `src/m1/game/core/resist.ts` | `hurtTaken`, `setHurtScale`. |
| `src/m1/game/core/effects.ts` | Drops (`setDropTable`). |
| `src/m1/game/platform/speech.ts` | `say`, `pickLine` (the 45 s no-repeat rule), `holdForSpeech`. |
| `src/m1/game/render/` | Drawing, including `render/player/` (`body.ts`, `tragonPose.ts`, `broomPose.ts`) and `pixelArt.ts` (banded gradients, dithering). |
| `src/m1/content/dialogue.ts`, `content/deaths.ts` | Shared hurt callouts and death lines (M1-style sources). |
| `src/m1/components/` | The shared HUD, `ButtonIcons.tsx` (`Prompt`), OptionsScreen. |

---

## 3. Where to tweak

Units: speeds are px per frame, times are frames (60 = 1 second), damage is out of 100 HP **before** M2's ×0.65.

### Global (all lands)

| What | Where | Now | Notes |
|---|---|---|---|
| Damage taken multiplier | App.tsx:156 `setHurtScale(0.65)` | 0.65 | 0.5 is easy, 0.8 is close to M1. |
| Enemy drops | App.tsx:160 `setDropTable({ health: 0.06, ammo: 0.05 })` | 6% / 5% | Small pickups only. Keep it lean: the grabs are the economy. |
| His melee vs. enemies | App.tsx:~154 `enemyMeleeDamage` | charge 14, slide 14, uppercut 45, divekick 45 | Slide 14 means a critter at 14 HP or less dies to one slide. |
| Player HP | m1 constants.ts:94 `INITIAL_PLAYER_HEALTH` | 100 | |
| Boss breather (i-frames) | m1 constants.ts:409 `ENEMY_HIT_COOLDOWN` | 60 | Shared with M1; change it per fight instead (`IFRAMES` in each fight.ts). |
| HUD power cell width | App.tsx:5 `M2_CELL_W` | 54 (was 38) | |
| Footsteps | App.tsx `setFootstepVolume(2.4)` | 2.4 | |
| Beatdown mob | moves/grab.ts:446-448 | `MOB_RANGE_X 420, MOB_RANGE_Y 150, MOB_MAX 2, MOB_STAND 56, MOB_WALK 2.6, MOB_WIND 20, MOB_STRIKE 9, MOB_LUNGE 6, MOB_BACK 14, MOB_CROSS 36, MOB_HOP 74, MOB_HIT 9, MOB_REST [45,100]` | How far away bystanders join, at most 2 at once, wind-up, strike, hit damage, rest between swings. |
| Victory jingle | victory.ts:19-37 | `EIGHTH 11.25`, `LEAD = 8*EIGHTH` (one bar before the first letter), `JINGLE = 28*EIGHTH`, `FLY 9`, `SQUASH 7`, letter `STEP 62`, `SIZE 54` | Letters stamp on the eighths; if you change tempo, change `EIGHTH`. |
| Line cooldown | m1 platform/speech.ts:66 `pickLine` | 45 s | |
| Music | music/engine.ts (bus, reverb, limiter), cues.ts (what plays where); the player's volumes are in OPTIONS → AUDIO | | Mix a single song with its parts' velocity / `v` in the MML. |

### Main bosses: the shared rule

Every land boss's `fight.ts` begins with `const HP = 666`, `SHARE = 0.35` (damage from anything that isn't its
weakness, scaled to 35%) and `IFRAMES = ENEMY_HIT_COOLDOWN`:

| Boss | File |
|---|---|
| Safari Artie | adventure/clearing/fight.ts:82, `SHARE` at :97 |
| Donnie Dracula | spooky/ballroom/fight.ts:76 |
| Space Queen | space/queen/fight.ts:84 |
| Stuntman Steve | hollywood/stunt/fight.ts:66 |
| Helicopter Harry | foreign/harry/fight.ts:72 |
| Tucker | frontier/arena/fight.ts:68-70 |
| Piper | fantasy/bedroom/fight.ts:80-82 |
| Stupid Dad | cartoon/amphi/ (placeholder; no fight yet) |

Sub-bosses have no i-frames and big HP (Spooky's demon has 2400). Look for `hp` in that section's `kinds.ts` /
`fight.ts`.

### Wilderness Land: Tucker (frontier/arena/fight.ts:72-98)

Each `[a, b]` pair is [start of fight, late in fight].

| Constant | Now | Meaning |
|---|---|---|
| `LISTEN / COCK / AIM / PAN / RECOIL / RELOAD` | [80,30] [16,10] [54,26] [22,13] [16,10] [66,32] | His shot cycle; lower is faster and harder. |
| `TRACK`, `WOBBLE`, `JERK` | [0.05,0.085] [20,58] [0.03,0.1] | How fast his aim homes in, how much it wanders. |
| `BALL_V`, `BALL_DMG`, `SPREAD` | [18,25], 46, 0.03 | Ball speed and damage (46 × 0.65 ≈ 30). |
| `WALK`, `TOO_NEAR`, `WANT` | [0.45,0.85], 150, 300 | His shuffle and spacing. |
| `RUN_CHANCE / RUN_V / RUN_LEN / RUN_FIRE / RUN_ERR` | [0.3,0.55] [3.2,4.6] [70,140] [26,46] 90 | The blind flailing run. |
| `ERR` | jump 40, land 30, step 70, shot 16 | How well he hears each noise (px of error). |
| `CRITTERS / FIRST_IN / GAP / FLY_SHARE` | [5,8] 22 [6,20] 0.3 | The stampede after each shot. |
| `MAX_CRITTERS`, `MAX_CORPSES` | 10, 6 | Performance caps. |
| `BEE_V / STING / STING_GAP / BEE_OFF / SECOND_SWARM` | [1.5,2.3] 3 55 50 0.4 | The bees (the second swarm comes in below 40% HP). |
| `SHOWERED / LION_WAIT / LION_V / MAUL_T / MAUL_DMG / MAUL_TICKS` | 5 46 7.5 170 140 5 | The weakness: blood globs needed, then the mountain lions. |
| `TAUNT_EVERY`, `HINT_GAP` | 520, 900 | Chatter. |
| `BEES_ON` (:438) | **false** | The bees are switched off at your request. The bee constants above are dead code until it's true. |
| critters.ts:46-54, :109 | rabbit 9/6, squirrel 7/5, raccoon 13/7 … ; LION hp 400 | Stampede critters (hp/damage) and the lion. |

Other Wilderness Land knobs:

| What | Where | Now |
|---|---|---|
| Log ride speeds | logride/layout.ts:74 `SPEEDS` | `[from x, px/frame, can brake/paddle]`: station 1.6, canyon 2.6, lift 1.4, big drop **8** (x 3900), sewer 3.0, culvert **7.5**, waterfall **8** (x 9860), sluice 1.7 |
| Log ride handling | logride/ride.ts:35-39 | `PADDLE 1.75`, `BRAKE 0.38` (multipliers), `JUMP_V 9.6`; hazards.ts:34 `SAW_DMG 15`, :52 cutter `SLAM 16` |
| Train | train/layout.ts:32 | `V_FULL 9`, `V_INTRO 3`; `CARS` (22 cars, the cut couplings on cars 2/7/12/17) at :56-81; drift cars.ts:196 `DRIFT_MAX -1.6, BLOW_AT 170`; thrown damage shots.ts:20 (suitcase 9, cleaver 11, coal 8, cinder 6) |
| Dirt bike teens | dirtbike/chase.ts:59-80 | `WAVES` (3,4,5,5,6,7 teens; wind-up 50→34; teen hp 3-4); parry `TELL 18 / SWING 9`; bike `CRUISE 140, BOOST 200, BRAKE 50`; damage to him `BAIL 32, HIT 14, WRECK 10, BOMB 18` |
| Wilds hazards | wilds/hazards.ts | bear trap :48 (`TRAP_DMG 13, TRAP_HOLD 80, MASH 9`), rolling logs :386 `ROLL_DMG 14`, quills :436 `8`; leeches wilds/leeches.ts:22 |
| Air underwater | frontier/air.ts:20 (and adventure/river/index.ts:51) | `AIR_FRAMES 1350`, `AIR_REFILL 7.5`, 7 damage every 45 frames |
| Enemies | wilds/kinds.ts:699-711, town/kinds.ts:697-714, train/kinds.ts:452-458, logride/kinds.ts:165 | e.g. bison 400/20, cougar 165/17, sheriff 260 |

### Fairy Land

| What | Where | Now |
|---|---|---|
| **Truelling Tragons speed** | fantasy/tragons/layout.ts:120 | `V_TEACH 5.6, V_RIDE 7, V_LATE 7.5`. The warnings are timed in frames, so they keep their timing at any speed. |
| **Fairy Wheel QTE** (fantasy/wheel/qte.ts:60-87) | `beatsFor` | 2 beats per fight, rising with level (`2 + level/4`). Mash: `6 + level/2` presses in 230 f. Press run: `3 + level/3` buttons, `max(60, 100 - 3*level)` f each. Alternate (tug-of-war): `9 + level/2` presses in 240 f. Ring: `2 + level/4` rings, `max(72, 112 - 3*level)` f. Dazed is ×1.2 time. |
| | constants | `BAND [0.03,0.38]` (the ring's hit band; wider is easier), `LOCK 30`, `PAUSE 22`, `GRACE 10` (the first frames ignored), `FLUB_COST 14` (one forgiven miss per beat) |
| **Broom deathmatch** (fantasy/broom/fight.ts:201-212) | flight | `CRUISE 22, BOOST 40, BRAKE 11, TURN 0.04, CLIMB 10` |
| | laser | `BOLT_V 64, BOLT_LIFE 60, FIRE_EVERY 8`; lock-on `HOLD_T 12, LOCK_T 26, HOME_V 46, HOME_DMG 5` |
| | ram | `RAM_R 150, RAM_DMG 6, RAM_AGAIN 45` (two or three rams kill) |
| | suitors (:86-92) | hp: blake 13, rafael 14, hank 18, chet 12, thaddeus 12, dmitri 16; `turn` and `speed` per suitor |
| | arena | broom/world.ts:9 `WALL_R 5000, MIN_ALT 40, MAX_ALT 2700`; victory lap `LAPS 2` (fight.ts:834) |
| **Piper** (fantasy/bedroom/fight.ts:80-116) | damage | `SLAM_DMG 22, BODY_DMG 10, BOUNCE_DMG 14, DEBRIS_DMG 11, CHANDELIER_DMG 24` |
| | slam timing | `CROUCH_T 46, RISE_T 30, HANG_T 36, TRACK_V 7, LOCK_T 14, FALL_G 2.2`; quake stun `STUN_T 26` |
| | debris | `DEBRIS_WARN 80, DEBRIS_MAX 6` |
| | element zones | `HEAT_DMG 24, NITRO_DMG 14, SHOCK_DMG 26`, `NITRO_REFREEZE 70`; sizes `HEAT_HW 44, NITRO_LEN 280, PUDDLE_HW 150` |
| | throws | `THROW_GAP 360, THROW_NEAR 170, RIP_T 36, THROW_T 18, FIREBALL_DMG 12, ICEBALL_DMG 6, BOLT_DMG 14` |
| | ice mash | `MASH_STEP 0.11, MASH_DRAIN 0.0035, ICE_MAX 260` |
| | flintlock weakness | `HOLE_DMG 150, HOLES_TO_DIE 4`; balloon `BOUNCE_T 150, BOUNCE_EACH 30, BOUNCE_V 10` |
| | misc | `START_GAP 460` (her minimum distance at the start), `HOP_CHANCE 0.008`, `TAUNT_EVERY 700` |

More Fairy Land knobs:

- **Tragons:** ride.ts:39-41 (`HOP_T 20`, `HOP_CD 32` car-hop cooldown; loop grip `GRIP_SLIP 5`, `GRIP_GONE 16`).
  Obstacle damage is at ride.ts:250-256 (ring 12, icicles 11, arc 12, jet 11, bar 10).
- **Wheel:** a lost QTE is 46 damage (wheel/index.ts:277), a suitor's throw 10 (:155). The suitor roster is in
  wheel/layout.ts:51-60.
- **Piper's waddle and element clocks:** bedroom/fight.ts:88 (`WALK_V`, `WALK_T`, `SIT_T` per health third) and :100
  `HAZ` [quiet, tell, on]. What each slam tears loose is at :587-593, and the room's width at
  bedroom/layout.ts:18 `ARENA_W 1500`.
- **Broom damage to him:** broom/fight.ts:208 (bolt 8, snipe 13, ram 18...).
- **Enemies:** square/kinds.ts:393-405 (troll 420, dragon 300), glen/kinds.ts:383-388, keep/kinds.ts:255-257.

### Jungle Land (adventure/)

| What | Where | Now |
|---|---|---|
| Safari Artie | clearing/fight.ts:82-110 | `HP 666`, `SHARE 0.35`; `SPIT_EVERY [0,170,140,110]` (darts per phase); `STAB 9, DART_DMG 5, POISON_TICK 3`; `COUNTER_STAB 14`; the stampede on him `TRAMPLE_DMG 150`; cover `BUSH_HP 90, VINE_HP 30` |
| T. rex (sub-boss) | dino/rex.ts:68-91 | `PART_HP` head 520, body 650, legs 460, tail 360; attacks `BITE 18, SPRINT 22, TAIL 16, SHOCK 14`; speeds `WALK 1.05, SPRINT 7.2`, `SPRINT_EVERY 330±120` |
| Mine cart | cart/index.ts:146 | 3.2 out of the station, then 7. Hazards: beam 16 (:198), Artie chase 20 (:248), boulder 14 (:254). Trick timings cart/tricks.ts:41-54 |
| Boat | river/course.ts:15 | `BOAT.speed 1.8` |
| Temple traps | temple/index.ts | boulder 14 (:91), dart 8 (:123), snake 12 (:143) |
| Enemies | jungle/animals.ts:279-285, river/kinds.ts:120, dino/kinds.ts:182, temple/kinds.ts:65, guides.ts:155 | e.g. jaguar 120/18, raptor 120/12, guide 160/10 |

### Spooky Land (spooky/)

| What | Where | Now |
|---|---|---|
| Donnie Dracula | ballroom/fight.ts:76-113 | `HP 666`, `SHARE 0.35`; weakness `REDEEMER_DMG 90 / STUN 120`; per-phase `HOVER_T [0,140,110,88]`, `AIM_T`, `DIVE_T`; bite `DRAIN_DMG 5 / HEAL 5 / EVERY 18`; `GUEST_EVERY [0,640,520,420]`; blood spew `BLOOD_DMG 14` |
| Demon (sub-boss) | hell/demon.ts:61-100 | `HP 2400`; `THRUST/SLAM 26, SWEEP 22, BELLY 28, QUAKE 10`; wind-ups `52/62/48`; `STAGGER_AT 520 / STAGGER_FRAMES 80` |
| Hell hazards | hell/hazards.ts:35-37 | `LAVA_DMG 16, JET_DMG 18, FIREBALL 12`; jet cycle 160 (warn 70, blast 112) |
| Tower | tower/hazards.ts, tower/ride.ts:57-66 | gear 10, pendulum 14/12, debris 7; elevator `RISE 2, LIFT 1.6` |
| Dungeon ceiling | dungeon/index.ts:45,57 | wait 30, `FAST 1.2` |
| Enemies | town/kinds.ts:407-420, castle/staff.ts:321-366, tower/kinds.ts:282, hell/kinds.ts:197, control/staff.ts:207 | e.g. wolfman 160/14, mummy 360/12, mascot 340/16 |

### Future Land (space/)

| What | Where | Now |
|---|---|---|
| Space Queen | queen/fight.ts:84-140 | `HP 666`, `SHARE 0.35`; `BIRTH_EVERY [0,240,170,120]`, `KIN_CAP [0,3,5,5]`; `LEAP_EVERY [0,720,520,360]`; `FLAIL_DMG 28`; batted can `BATTED_DMG 60`; mallet `MALLET_HIT 45 / SMASH 95`; `DROP_EVERY`; `POOL_DMG 22`. Drops in her fight: queen/fight.ts:293 |
| UFO (sub-boss) | orbit/ufo.ts:48-50 | `HP 9000`, `SHOT_DMG 11` |
| Orbit shooter | orbit/kinds.ts:333-349, orbit/gun.ts:37 | fighter 50, kamikaze 30 (hits 18), cruiser 520; ray-gun cooldown by level `[4,3,3,3,3,3]` |
| Train sled | ride/layout.ts:59-65 `speedAt` | 2.6 → 4.3 → 2.6 (lift) → 7.6 → 6.6; the runaway `cap 26` (ride/index.ts:55); obstacles 18 (ride/tricks.ts:159) |
| Enemies | square/kinds.ts:274, atom/kinds.ts:199, crater/kinds.ts:381, queen/kin.ts:279 | e.g. robot 340/12, brute 360/16, charger 170/16 |

### Hollywood Land (hollywood/)

| What | Where | Now |
|---|---|---|
| Stuntman Steve | stunt/fight.ts:66-89 | `HP 666`, `SHARE 0.35`; weakness (spellbook lightning) `ZAP_FIRST 24, ZAP_EACH 6, ZAP_HOLD 26`; cars per phase `RED_EVERY [-,165,130,100]`, `BLUE_EVERY [-,230,180,140]`, `MAX_RED [-,3,4,5]`, `MAX_BLUE [-,1,2,3]`; `FAR 1000 / FAR_RATE 1.35`; thrown car `THROWN_DMG 120`; `FLAIL_DMG 3` |
| Steve's cars | stunt/cars.ts:45-60 | `RED V 10.5`, `BLUE V 9`; damage `HEADON 10, DRIFT 6, LAND 10, WALL 8`; `RAMPS_N 5` (:116) |
| Ensemble Cast (sub-boss) | warehouse/cast.ts:48-77, warehouse/fight.ts:47-220 | 30 heroes (hp 94-244, speed 0.9-1.9); `CRUSH 6` on him kills; `capOf = min(10, 5 + killed/2)` up at once; pile 3 a tick, flop 10 |
| Toilet coaster | coaster/track.ts:137-273 | `G 0.26`, `LIFT_V 4.5`, `MIN_V 4`, `LOOP_V 15`, `ROLL_V 13`, launch to 26; `INSANITY` loop radii (:184); fumes layout.ts:116 (7 to him); thrones.ts:40 `CLOG 900, WARN 150` |
| Disaster ride | disaster/show.ts:23 | `FX_LEN 300`, `GAP 110`; heater fire 8 (index.ts:99) |
| Havoc | havoc/hazards.ts, havoc/chase.ts, havoc/layout.ts | lava 18 (:105), quake chunks 14, flood 12 (rise rates :199), wrecking ball 15, hail 4; avalanche 40 / 22 repeat (`AV_V 18`, `AV_TELL 200`, layout.ts:150); tornado zone layout.ts:157 |
| Warehouse / lot hazards | warehouse/layout.ts:95-101, lot/layout.ts:37-38 | lights `every 300, tell 70, dmg 14`; pyro 10; rain zap 13; tank flood 11 |
| Enemies | blvd/kinds.ts:304, coaster/kinds.ts:264, warehouse/kinds.ts:365, lot/kinds.ts:157, disaster/kinds.ts:185, havoc/kinds.ts:207 | 90-170 hp; hits 8-15 |

### Foreign Lands (foreign/)

| What | Where | Now |
|---|---|---|
| Helicopter Harry | harry/fight.ts:71-111 | `HP 666`, `SHARE 0.35`; weakness (crossbow) `QUEASY_DARTS 10, DART_DMG 2, SICK_COOL 150`; statue barf `HEAVY 150, SPLASH_DMG 18`; M60 `BURST_N 5, BURST_REST [-,50,42,34], ROUND_DMG 9`; sweeps `SWEEP_DMG 10`; statue smash `FIST_DMG 32, STUCK_T 400`; `STATUE_LIFE 6`; rage `RAGE_WALK 1.35`; `PIN_DMG 13` |
| Helicopter (his) | heli/copter.ts:36-45 | `GUN_CD 4`, `ROUND_DMG 22`; rockets `ROCKET_MECH 70`, `ROCKETS_ON true`; boost `BOOST_T 16, BOOST_V 15, BOOST_CD 14` |
| Mechs | heli/mechs.ts:33-41 | HP eiffel 3600 … moai 6600 (pisa topples); **`HP_SCALE 1.6`** (higher = shorter mech fights); `MECH_DMG 1.3`; `SHOT 18, BIG_SHOT 26`; phase thresholds :388; attacks inline in `MOVES` (:232+); order heli/lines.ts:15 |
| Jet goons | heli/goons.ts:219 | hp 40, contact 12, `SHOT 12` |
| Pavilion set pieces | each pavilion's set-piece file | e.g. japan/station.ts:41 bullet train `v 30, EVERY 430, WARN 105`, hits 18; morocco/souk.ts:41 stampede 14; china/ridge.ts:47 mortar 11 |
| Enemies | `<pavilion>/kinds.ts` | 75-260 hp (sumo 260, moose 200); melee damage in `meleeHit(...)` calls; ranged in foreign/shots.ts:53 `DMG` |

### Cartoon Land (cartoon/)

Sections, from geometry.ts:24-47: kiddie (0-5, Sillyville Square), studio (10-15), whitehouse1 (20-26),
whitehouse2 (30-37), bigkid (40-46), itchy (50-57, Punchy & Kicky), amphi (60-62, Stupid Dad).

| What | Where | Now |
|---|---|---|
| Pundit mini-bosses | whitehouse1/state.ts:96, whitehouse2/state.ts:130 | `PEROT_HP 3900`, `FALWELL_HP 5400`, `LIMBAUGH_HP 5000`, `DOLE_HP 5800`, `NEWT_HP 7400`. Contact damage: whitehouse1/pundits.ts:107, whitehouse2/pundits.ts:120 |
| Stupid Dad | amphi/scene.ts:1-19, :288-312; amphi/index.ts:122-127 | Placeholder card only (section 5) |
| Looney hazards | itchy/hazards.ts:104-106 | anvil `A_TELL 30, A_FALL 26, A_CYCLE 170`; hammer `H_WIND 40, H_SLAM 10`. Damage: anvil 16, hammer 18, dynamite 18, cannon 13, rake 8 (:200-557) |
| Kiddie rides | kiddie/hazards.ts:68-173 | `TRAIN_V 2.6`, `TROLLEY_V 3.2`; carousel 10, train 13, trolley 14 |
| White House hazards | whitehouse1/hazards.ts:44-234, whitehouse2/hazards.ts:87-224 | vacuum `VAC_SPEED 3.2` (12 damage), globe 14, `JELLO_BOUNCE 17` |
| Big-kid rides | bigkid/rides.ts:289-435 | 10-13 damage |
| Respawn grace | cartoon/index.ts:64 | `GRACE 120`, `GRACE_RANGE 650` (nearby enemies frozen after a respawn) |
| Enemies | kiddie/kinds.ts:396, studio/kinds.ts:378, whitehouse1/kinds.ts:287, whitehouse2/kinds.ts:227, bigkid/kinds.ts:394, itchy/kinds.ts:363 | e.g. mascot 380, pencil 240, gloppy 240 |

### More shared numbers

| What | Where | Now |
|---|---|---|
| Shakedown | moves/grab.ts:142 | `SHAKE_AMMO 3`, `SHAKE_DROP_EVERY 12`, `SHAKE_FRAMES 44` |
| Beatdown | moves/grab.ts:125 | `PUNCH_DAMAGE 28`, `PUNCH_HEAL 2`, `KILL_HEAL 10` |
| Music level | music/engine.ts:86-90 | `MUSIC_LEVEL 0.24` (master), `DUCKED 0.42` (under speech), `QUIET 0.6` (cutscenes), `XFADE 1.5` s, `DEFAULT_REV 0.22` (reverb) |
| Player feel | m1/constants.ts:95-162 | `PLAYER_INVINCIBILITY_FRAMES 75`, `JUMP_HOLD_FRAMES 15`, coyote 7 / buffer 5, `POWER_CELLS 2` (:156), `POWER_CELL_RECHARGE 30` |
| Ammo | m1/constants.ts:187-215 `MAX_AMMO` | e.g. MALLET 100, SPELLBOOK 100 |
| Boss reference values | m1/constants.ts | `WEAKNESS_DAMAGE 100` (:408), `BOSS_CHARGE_DAMAGE 35`, `BOSS_UPPERCUT_DAMAGE 50`, `BULLET_DAMAGE 25` |
| Death text sizing | deathText.ts:69-85 | Fits to the canvas width minus 80: one line at 48 px, otherwise wraps at 30 (16 at minimum). **The 28-character rule is not enforced in code**, so keep to it yourself. |
| Line cooldown | m1/game/platform/speech.ts:39 | `LINE_REPEAT_COOLDOWN_MS = 45_000` |

The 666 / 35% rule has **no shared constant**: each boss's `fight.ts` keeps its own copy. To change it everywhere,
edit all eight.

### Finding anything else

Every land follows the same pattern. Boss knobs sit at the top of `<boss section>/fight.ts`, just under `const HP =
666`, each with a one-line comment. Enemy stats live in `<section>/kinds.ts` (or `kinds.ts` / `critters.ts` at the
land level) as `KindDef` entries: `hp`, contact `damage`, `speed`, `mass`, and `pointy` / `spiky` for move counters.
Ride speeds are in the ride section's `layout.ts`: the Jungle mine cart is in `adventure/rideCart.ts` and
`adventure/cart/`, Hollywood's coaster in `hollywood/coaster/`, the helicopter in `foreign/heli/`. To find a knob,
search the section folder for `const [A-Z_]+ =` (the regex option in VS Code search).

### Checkpoints

- Each section exports `checkpoints: [{ name, cp, x, y, manual?, clear? }]`. Example:
  fantasy/bedroom/index.ts:81 (`CP_HALL 60`, `CP_FIGHT 61` in bedroom/layout.ts:45).
- The land's `index.ts` collects and sorts them (e.g. fantasy/index.ts:55 `FANTASY_CHECKPOINTS`). A checkpoint is
  reached when he walks past its `x`, unless it's `manual` (then a scene sets it).
- Numbering: each section owns a range of ten (see that land's OWNERSHIP.md). A new one takes an unused number inside
  its section's range, and the CHECKPOINT SKIP cheat lists it automatically.
- A checkpoint whose spot depends on world changes must restore them. Keep that state in `state.stageMemo` under
  `m2:` keys, not in `sectionState` (which is rebuilt every life).

---

## 4. How to change common things

**A voice line**
1. Find the pool by searching for a word in the line. Land lines live in `<land>/<section>/lines.ts` or
   `<land>/lines.ts`; global ones are in `src/m2/lines/`.
2. Add a plain string to the array. Bosses need clean / shitty / naked variants. Say only `JUNGLE`, `WILDERNESS`,
   `FAIRY` names. No time words unless the line picks by time of day (`Gag.byTime`).
3. Code that speaks a line must pick it with `pickLine(pool)`, never `pool[Math.random()...]`.
4. Run `npm run voices`, check that the line isn't in `unresolved.txt`, then `npm run release:m2`.
5. If a word comes out wrong, add a fix to `pronunciations.json` and run `npm run voices` again.

**A sign's text:** search for the current wording (signs are drawn in the section's `art.ts`, `paint.ts` or
`layout.ts`, often through `signLetters.ts` / the land's `letters.ts`). Keep the length similar, or the board and its
poles will need resizing.

**A checkpoint:** add an entry to the section's `checkpoints` array with a free number in its range, and an `x` / `y`
standing spot on solid ground. Test both a death after it and a CHECKPOINT SKIP straight to it.

**An enemy's stats:** edit its `KindDef` (`hp`, damage, speed) in the section's `kinds.ts`. Reference points: a
critter one slide kills is ≤14 HP, and tune enemy damage against the ×0.65.

**A hurt source's lines or death text:** each damage source has a string id passed to the hurt call. Its hurt lines
and `death:` pool sit in the section's HurtTable / `registerHurtLines` (search for the id). **Death text must be 28
characters or fewer**, one line. Then run `npm run voices`.

**A song:** follow music/MUSIC.md "Adding a song". Check it in the SOUND TEST.

**After any change:** `npm run lint`, then `npm run release:m2`, then play it in `Meathead2-cheats.html`, then commit
with explicit paths.

---

## 5. Known issues, untested items, open decisions

Labels: **[DECIDE]** is a design call for you, **[BUG]** needs fixing, **[UNTESTED]** was built but never played,
**[NOT BUILT]** is missing, **[CLEANUP]** is harmless housekeeping, **[GIT]** is repo upkeep.

| Label | Item |
|---|---|
| [UNTESTED] | **Most of Fairy Land and nearly all of Cartoon Land** were built and SNES'd without a playtest. Play them start to finish with the cheats build, and use CHECKPOINT SKIP to retry each section. |
| [NOT BUILT] | **Stupid Dad's fight** (cartoon/amphi/scene.ts:16): a PLEASE STAND BY / BOSS FIGHT COMING SOON card stands in. His intro, the amphitheater and his lines exist. The mechanics are yours to design, and the 666 / 35% / breather rule plus two deaths (weakness and standard) apply. |
| [NOT BUILT] | **The intro cutscenes and the fake ending** are still pending. |
| [NOT BUILT] | Stupid Dad's two deaths (weakness and standard) wait on the fight (cartoon-spec.md:531). |
| [DECIDE] | **Broom fight grounds:** green summer lawn inside the magic wall, snowy outside (fantasy/broom/ground.ts:5-17, fantasy-spec.md:801). It was deliberate, but it clashes with the snowy castle base. Choose green or snowy. |
| [BUG] | **Broom texture hitch:** a stutter as the fight starts. The likely cause is the 2048 px mode-7 floor (`TS` in broom/ground.ts), the sky and the billboards all painted at once on the first frame. Fix by painting them earlier, during the runway or the mount. |
| [BUG] | **Jungle temple: checkpoint 40 to 41 gap.** cp 40 is at T+150 and cp 41 at T+3050, about 2900 px apart (adventure/temple/index.ts:251-252). Add one between them (the range 40-49 is free). |
| [UNTESTED] | Jungle Land's SNES pass (jungle, cruise, dino, temple, mine cart: 2026-10-20) and its new checkpoint layout (dd03d669: 22 checkpoints became 31, with world-state restores at the new spots). |
| [NOT BUILT] | Jungle Land's roof and clearing SNES work was **uncommitted** in the working tree on 2026-10-20 (roof/art.ts, clearing/index.ts, guides.ts, new clearing/guideArt.ts). Commit or discard it. |
| [BUG] | The mine cart's signs (FRIENDLY GUESTS / UNFRIENDLY GUESTS / GAP AHEAD) still use the stock font: adventure/cart/art.ts:633, 634, 856. That breaks the themed-sign rule. |
| [UNTESTED] | Fairy Land's whole SNES pass, the Tragons survival rework (fantasy-spec.md:565-600), the Piper fight after its rebuild, and the keep/runway section. |
| [UNTESTED] | Cartoon Land's music, the Sillyville revisit (rides shut), and the title screen and save files (a6dca958). |
| [DECIDE] | Tucker's bees are off (`BEES_ON false`, frontier/arena/fight.ts:438). Open Wilderness questions: whether the gore bag empties at fight start, whether Tucker's blood goes in the bag, whether bees and critters hurt Tucker. |
| [DECIDE] | Hollywood stunt wires: up reels in. You may have meant the reverse; it's a one-line swap (see db7aa6dd). |
| [BUG] | Hollywood: hex light colors over-light the player in other sections. A shared lighting fix was waiting on your OK (b03ae7db). |
| [UNTESTED] | Hollywood: the warehouse grab while others pile on (394e767c) and Steve's car throw through the grab (f454530) were flagged as the riskiest changes. |
| [DECIDE] | Future Land: the XENOSCARE sign on the queen's walk-away is crossed by the disco lamps (walkAway/spaceQueen.ts:270), and the ride's dialogue overlaps the cue signs (space/ride/index.ts:437). |
| [UNTESTED] | Voice lines listed in `tools/voices/unresolved.txt` (e.g. intro MEATHEAD_* lines, some weapon pools) may play as text only. |
| [NOT BUILT] | The M2 icon is only a draft (tools/icon/render-m2.ts); the M2 .exe / Steam build isn't started. |
| [NOT BUILT] | Planned for later: hidden areas (leave room for them), hard / very hard variants, weapon upgrades, the real endgame and the necromancer boss rush. |
| [CLEANUP] | Stale comments: frontier/geometry.ts:42 says Tucker is "not designed yet"; space/geometry.ts:40 and hollywood/geometry.ts:40 call their bosses placeholders; hollywood-spec.md:204 calls Steve's walk-away a placeholder. All of these are built now. |
| [GIT] | On 2026-10-20 `master` was about 190 commits ahead of `origin/master`. **Push it** (`git push`) so there's a backup. |

Before relying on this list, read each land's `*-spec.md` decisions log (its last entries) and `git log --since=2026-10-15`:
commit bodies note "what to check" items.

---

## 6. House rules (the standing design rules)

**Combat and balance**
- M2 damage taken ×0.65; drops are rare and small only; shakedown = 3 small ammo; the beatdown restores health.
- Land bosses: 666 HP, 60-frame breather, non-weakness damage at 35%. Sub-bosses: no i-frames and lots of HP; both
  sides lock once one is active, and they're never respawned once beaten.
- Every land boss has exactly two deaths: the weakness death and a standard death, which is a joke set piece of its
  own. Deaths are undignified both ways.
- Weaknesses exploit the boss's mechanics, not just extra damage. Weapons get no instant kills or status effects on
  bosses unless opted in (no flintlock headshots, no crossbow vomit, the soul sucker draws blood).
- Melee roles: the charge makes space, the slide one-shots tiny critters only, the dive kick and uppercut are the big
  hits. Dive-kick infinites are intentional.
- Move-counter enemies (`pointy` stops the charge, `spiky` stops the dive kick) force you to mix moves.
- Flung enemies do collateral damage by mass × speed. Hazards and rides hurt enemies too, and no enemy idles in them.
- Every M2 enemy is new (no M1 kinds). Human enemies are mixed: women, skin tones, builds, hair.
- In wave-gated or fixed-screen fights, active enemies stay on screen.
- A big health and ammo pickup sits before every boss door.

**Levels**
- Teach a hazard safe, then escalate. Each land has one new traversal mechanic (Jungle: vines; Spooky: ladders...).
- Each land plays for about 5-6 minutes (Jungle Land's length).
- Revisits are always possible and look or play differently. Destruction never blocks the way back.
- Checkpoints restore the world as the run left it.
- Standable things read as standable (lit top lip); impassable things read as impassable (duck-unders are full walls).
- Signs are readable, unobstructed, physically held up, in themed lettering.
- M2 bosses are grudges: people he pissed off early in the land.
- No volcanoes in new art.

**Dialogue and text**
- American spelling and US units.
- Short, blunt, vulgar, specific; talk less.
- Pick lines with `pickLine`: no line repeats within 45 s.
- No talk-over: scripted lines finish before the next starts.
- Text shows only while the voice plays, and there's no browser TTS.
- Subtitles stay whole on screen (`saidOver` clamps them).
- Death screens are one line, ≤28 characters.
- Every new hurt source gets voiced hurt lines and death lines.
- Boss lines come in clean / shitty / naked pools; NPC lines get the same three variants.
- Lines never name the wrong time of day.
- Lines name the right land and city.
- Never state that he reaches bosses by accident.
- On-screen land names are JUNGLE, WILDERNESS and FAIRY (code ids stay adventure / frontier / fantasy).

**UI and controls**
- Six-button budget: new moves are chords or context, never a seventh button.
- Gameplay buttons stay positional on every pad; only menus swap confirm and back for Switch. The exception is the
  broom's boost and brake on Nintendo pads.
- Prompts show real button icons and switch live between pad and keyboard. Words in the world are action words
  ("JUMP!"); no DUCK/JUMP text tells that name buttons.
- Unusual-control sections get a pause controls card and a "pause for controls" prompt.
- Cutscenes take no input, show no HUD from frame one, and skip all-or-nothing (SKIP >>).
- A despawn is never a kill, and kill callouts match the creature.
- Water falls splash.
- HUD clear zone: top bars stay right of `HUD_CLEAR_X` / below `HUD_CLEAR_Y`.

**Art**
- The goal is SNES: color ramps, banded gradients, stepped shading, dithering.
- Fake 3D uses one eye per scene and straight walls, never draws a depth layer over nearer things, and culls by
  on-screen position.
- Held weapons are drawn in front of the face.
- Time of day follows lands cleared; outdoor skies read it.
- Kept jokes: drones bleed, the urinal easter egg.
- Never cut visuals to reach min spec.

**Process**
- Polish over new features.
- Standing rules regress: check them against every change.
