# Meathead 2 smoke test

Loads every checkpoint of every land (plus the title, the way in, three hub spots, and each land entered through its
hub portal) in headless Chromium (Playwright) against the Vite dev server. At each one it plays a few seconds with a
dumb input script, then reports what went wrong.

```
node tools/smoke/run.mjs                        everything (about 340 visits; ~25 min at --jobs=3)
node tools/smoke/run.mjs fantasy cartoon:21     one land (all its checkpoints), or land:cp
node tools/smoke/run.mjs title intro hub portal also: the title, the way in, the hub spots, the portal entries
```

Options:

- `--secs=8`: how long each visit plays.
- `--jobs=2`: how many visits run at once.
- `--port=5181`: the port for its own dev server.
- `--url=http://localhost:5182`: use a dev server that's already running instead of starting one. Start one with
  `node tools/smoke/serve.mjs 5182`. It doesn't watch files, so restart it after editing source.
- `--blank=1`: the BLANK threshold, in seconds.
- `--stall=6`: the STALL threshold, in seconds.
- `--fault=draw|blank|stall`: a self-test. It fakes that failure on every visit, to prove the check catches it.
- `--shots`: a PNG of each failing visit, saved to `tools/smoke/out/`.
- `--headed`: show the browser.
- `--only-fail`: print only the failing rows.
- `--json=tools/smoke/out/last.json`: where the full results go.

The exit code is 1 if anything failed, 2 if the harness itself couldn't run.

## What each visit does

The page is `meathead2.html?<land>=<checkpoint>`, the dev start each land's `index.ts` reads (`adv`, `spooky`,
`space`, `hollywood`, `foreign`, `frontier`, `fantasy`, `cartoon`). It also uses `?hub=<spot>`, and `?intro`, which
goes straight into the way in with no title. The checkpoint lists come from the game's own `*_CHECKPOINTS` exports.

At each visit the harness:

1. Turns on god mode and infinite ammo.
2. Holds right, hops every 0.9 s, and fires (left mouse) on and off.
3. Once a cutscene has offered SKIP for 4 s, skips it (`skip.ts` requestSkip), so scenes that need a skip get
   exercised too.

## What it catches

| tag | meaning |
| --- | --- |
| ERR | A page error, or a `console.error`. |
| DRAW | A frame's drawing threw (the red "DRAW FAILED: ..." on the canvas). It's counted in `window.__smoke` by `GameCanvas.tsx` (dev only), with the last error and stack. |
| FRAME | A whole frame (update + draw) threw. |
| BLANK | Every canvas on show stayed near one flat color for over `--blank` s. |
| STALL | He's in a cutscene (`player.inCutscene`), nobody's talking (`speech.ts` isTalking) and he isn't moving, for over `--stall` s. That's a scene waiting on something that never comes. |
| LOAD | The stage never started (`window.__m2`, set by each stage's update in dev, never appeared). |
| PORTAL | The portal at the hub never got him into the land. |
| HARNESS | The harness itself fell over on that visit. |

It also prints frame times: the median and p95 of the rAF intervals, in ms. A row tagged `[cutscene throughout]`
means he was still in a cutscene for the whole second half of the visit. That isn't a failure on its own, but it's
worth a look.

## Notes

- Don't run it while someone's playing on the same PC. It eats CPU, and their game stutters.
- `tools/smoke/serve.mjs` is Vite with file watching off. The watcher crawls `tools/voices/cache`'s ~28k files for
  minutes on Windows, then takes the server down.
