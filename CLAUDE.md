# Meathead (1 and 2): working rules

Two crude, satirical 2D action-platformers by John Albright, built entirely with Claude Code. All the art is drawn by
code, every voice is local text-to-speech, and the music comes from a synth written in code. There are no art or
audio asset files.

- **Meathead 1** (`src/m1`): finished and content-locked. It's the engine Meathead 2 runs on.
- **Meathead 2** (`src/m2`): 8 themed lands plus a hub and an intro. Feature-locked: polish and fixes only, no new
  systems. The alpha is going to itch.io.

The owner isn't a programmer. They test the built HTML files directly and describe what they want in plain words.

## How to work

- **Do what's asked.** Fill in unspecified details sensibly. Follow specifics exactly.
- **Small bugs:** a quick best-guess fix, then rebuild. No long investigations.
- **Performance problems:** measure first (tools/perf, Playwright frame-time scripts), then fix.
- **Your own checks:** if a screenshot or headless check fails, retry once at most. Then report and let the owner
  look. Never quietly debug test tooling for a long time.
- **Headless runs steal CPU** from the owner, who plays on the same PC. Use them only when needed, and kill any
  servers or browsers you start.
- **Reports are plain words:** what changed, what to check, whether it was tested. Don't claim you tested what you
  didn't.

## Every change, in order

1. `npx tsc --noEmit -p .` until it's clean.
2. New or changed voice lines:
   - Run `npm run voices`.
   - Lines outside a land's `*_VOICE_LINES` export must also be added to `tools/voices/m2pack.ts`, or they play
     silent.
   - Commit `tools/voices/manifest.json` too.
3. Build:
   - `npm run release:m2` builds `release-m2/Meathead2-cheats.html` (the one HTML at the folder's top) and the standard
     `release-m2/app/Meathead2.html` (what the Windows and Linux apps are packaged from).
   - `npm run release:web:m2` builds the itch folder `release-m2/web/`.
   - Meathead 1: `release:m1`, `release:web:m1`, `release:steam`.
   - One release build at a time.
4. `node tools/smoke/loadcheck.mjs`. It must show PRESS ANY BUTTON and no PAGEERROR.
5. Commit only your own paths:
   - `git commit -F <msg file> -- <paths>`, then `git push origin HEAD`.
   - Never `git add` except `git add -N` for new files. No destructive git.
   - Other agents may be committing at the same time.
   - Messages start `Meathead 2 <area>:`, say what changed, quote the owner's request, and end with the
     Co-Authored-By line.

## Standing design rules (the short list; more in the session memory)

- **Bosses:** 666 HP, a 75-frame breather (`BOSS_IFRAMES` in `src/m2/bossSpam.ts`), non-weakness specials at 25% (sub-bosses: 35%).
  - No more than about 5 seconds of spamming one attack. Ray gun and dive-kick chains especially.
  - Exception: Dad Guy after his couch is crushed has no breather and no multiplier.
- **Boss sins:** the 8 bosses are the 7 deadly sins plus a robot (Artie pride, Donnie gluttony, the Queen robot, Steve
  envy, Harry wrath, Tucker greed, Piper lust, Dad Guy sloth). Deaths and lines play to the sin.
- **Cutscenes:**
  - No player input and no HUD.
  - Skip is all-or-nothing.
  - No talk-over between lines.
  - Skippable ones (bar the intro) show speech bubbles; in play, plain text over heads.
- **Speech:** text shows only while it's spoken. Pick lines with `pickLine` (no repeat within 45 s). American
  spelling, ALL CAPS game text.
- **Art:**
  - SNES look: color ramps, banded gradients, dithering.
  - Portraits are grotesque Ren & Stimpy gross-ups.
  - Things you can stand on have a lit top edge; background look-alikes are dimmed.
  - No volcanoes in new art.
- **Performance:**
  - Locked 60 fps on a weak PC.
  - Paint art once (the stamp cache, baked canvases). No per-frame pixel work.
  - The stamp cache rejects rotated transforms: bake once, then draw turned.
- **Promo images:**
  - Meathead attacking, clean pants.
  - No boss deaths.
  - Nothing from Meathead 1's White House.

## Where things are

| What | Where |
|---|---|
| Each land | `src/m2/<land>/` (adventure=Jungle, spooky, space=Future, hollywood, foreign, frontier=Wilderness, fantasy=Fairy, cartoon) |
| Boss fights | `<land>/<section>/fight.ts` |
| Music | `src/m2/music/` (songs, cues.ts, soundTest.ts) |
| Weapons | `src/m2/weapons/` |
| Grabs | `src/m2/moves/grab.ts` |
| Saves | `src/m2/save.ts` |
| Progress | `src/m2/store.ts` |
| The alpha ending | `src/m2/alphaEnd.ts` |
| Boss-death GIFs | `tools/bossdeaths/` |
| Promo images | `promo/` (untracked) |
| Voice casting | `tools/voices/cast.json` |

## Picking up where things left off (out of usage, a new session)

The owner may run out of usage mid-task. In a new session:

1. Check `git status` and `git log --oneline -15` for what landed and what's half-done. Uncommitted changes are
   someone's unfinished work: read them before touching anything.
2. Read the session memory index (`MEMORY.md` in the project's Claude memory folder). Queue files there list pending
   jobs per land and the release plan.
3. Rebuild and run the load check before reporting anything as done.

Open items as of 2026-10-25:

- **Meathead 1 on Steam:** waiting on the owner's Steamworks App ID. Then add `steamworks.js` in
  `electron/steam.cjs` (overlay, achievements later), rebuild `release:steam`, and make the store capsule art in
  Steam's sizes.
- **Maintenance plan, after the alpha:**
  - About 20 smoke tests: each land loads, each boss fight starts, saves round-trip, both builds boot. Optionally run
    them on GitHub Actions.
  - Merge copy-pasted boss code into shared helpers.
  - Split the 1,500–2,000-line fight files.
- **An open question for the owner:** should weakness hits ignore a boss's 75-frame breather? Not decided.
- **Run `/code-review` after each batch of changes,** and fix what it finds before moving on.
