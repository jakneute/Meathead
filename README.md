# MEATHEAD

**What if Mega Man's special weapons didn't suck?**

Meathead is a crude, satirical 2D action-platformer. A government department that doesn't exist walks into a man's gym and hands him a list of supervillains. He doesn't care why. He kills them, takes their weapons, and turns those weapons on whoever's next. All the art is drawn by code, every voice is local text-to-speech, and the music comes from a synth written in code. There are no image or audio asset files.

> **Content warning:** cartoon gore, constant profanity, toilet humor and crude sexual jokes.

---

## Meathead (1)

Finished and content-locked. Fly to eight cities. Wreck the place, take the boss's weapon, use it on the next boss.

| Weapon | Taken from | What it does |
| --- | --- | --- |
| Shotgun Ice | Artie Avalanche | Ricocheting ice pellets freeze them solid. Then you shatter them. |
| Molten Flamethrower | Victor Volcano | A stream that grows as you hold it and burns their bullets out of the air. |
| Big Fuckin' Boulder | Ernie Earthquake | Roll it, throw it, spike it, then shoulder-charge it into a crowd. |
| TSUNAMI! | Hector Hurricane | One wave, the whole screen. Everything in front of it dies. |
| Sludge Barfer | Toxic Tommy | Toxic puke that rots the ground and drags flyers out of the sky. |
| Taser Overload | Blackout Barry | Locks on, fries, sets them on fire, and jumps to the next guy. |
| Oil Rocket Launcher | Oily Oscar | A steerable rocket that greases everything it hits. Then light it. |
| Rusty Needle Cannon | Drug Trade Dale | Stack the doses until they overdose and float off. |

### Play it

The built HTML file isn't in git — build it first with `npm run release:m1` (see **Building from source**), then open `release-m1/Meathead.html`. Double-click it; it plays in your browser offline, nothing to install.

- **Browser:** desktop Chrome or Edge.
- **Controller:** Xbox, PlayStation and Switch pads all work. Plug in and press a button; prompts switch to match.

### Controls (Meathead 1)

| Action | Keyboard + mouse | Controller |
| --- | --- | --- |
| Move | A / D or arrows | Stick / D-pad |
| Aim up / crouch | W / S | Up / down |
| Jump | Space | A |
| Fire | Left click | X |
| Secondary fire | F | Y |
| Shoulder charge | Right click or Shift | B |
| Slide | Down + right click, or C on the ground | Down + B |
| Uppercut | Up + right click, or E | Up + B |
| Dive kick | Down + right click in the air, or C in the air | Down + B in the air |
| Swap weapon | Mouse wheel / 1–9 | LB / RB |
| Pause / arsenal | Esc | Start |

Special moves cost one power cell. You get two; they refill over time. A dive-kick stomp refunds one.

---

## Meathead 2: Happy Land

Meathead goes to a theme park. Eight themed lands plus a hub and an intro. Plays on Meathead 1's engine, same moves plus grabs. The alpha is on its way to itch.io.

**The lands:** Jungle Land · Spooky Land · Future Land · Hollywood Land · Foreign Lands · Wilderness Land · Fairy Land · Cartoon Land

**The bosses** are the seven deadly sins plus a robot. They're set up early in their land and escalate until the fight. Each one has a weakness weapon; standard kills are ugly set pieces.

**The weapons:** ray gun, souvenir launcher, soul sucker, flintlock, spellbook, clapperboard, mallet, spawner, crossbow.

### Play it

The built HTML files aren't in git — build them first with `npm run release:m2` (see **Building from source**). Then `release-m2/Meathead2.html` is the standard build; `release-m2/Meathead2-cheats.html` adds the cheat panel (god mode, unlimited ammo, checkpoint skip, pants, time of day). Double-click either; plays in the browser offline.

The web folder (`release-m2/web/`) is the itch.io build (voice pack beside the page, not inside it).

### New controls in Meathead 2

Everything from Meathead 1 works the same. Meathead 2 adds grabs, a park map and a weapon wheel. Keys can be remapped in OPTIONS.

| Move | Keyboard + mouse | Controller |
| --- | --- | --- |
| Beatdown: tackle him, get on top, every hit heals you | R | Y + B |
| ↳ on top of him: punch / knee / headbutt | Left click / right click / F | X / B / Y |
| ↳ jump off | Space | A |
| Shakedown: up by the neck, shake the ammo out of him | T | Y + X |
| ↳ throw him / slam him | Hold a direction / hold down | Hold a direction / hold down |
| Air grab: leap up, grab one, drive him into the ground | Q | A + B |
| ↳ backflip / dive on the way down | Hold back / hold forward | Hold back / hold forward |
| Grab a small critter and throw it | R or T on a critter, then a direction | Y + B or Y + X on a critter, then a direction |
| Park map | Tab or M | Select |
| Weapon wheel | (mouse wheel / 1–9 to swap) | Right stick: push toward a weapon, let go to pick it |

The beatdown and the air grab each take **both power cells, full**, and the cells don't start refilling until the grab is over (if it ends in the air, not until you land). Short of that, the cells blink red. The shakedown and critter grabs are free. Some enemies are too fat or too greasy to grab at all.

---

## Building from source

You'll need [Node.js](https://nodejs.org). Run all commands from the project root (the folder that contains `package.json`).

```sh
npm install
npm run dev              # play both games at http://localhost:3000
npm run release:m1       # builds release-m1/Meathead.html + Meathead-cheats.html
npm run release:m2       # builds release-m2/Meathead2.html + Meathead2-cheats.html
npm run release:web:m1   # itch.io folder: release-m1/web/
npm run release:web:m2   # itch.io folder: release-m2/web/
npm run release:steam    # Meathead 1 desktop app for Steam (Windows): release-m1/steam/Meathead.exe
npm run release:steam:m2 # Meathead 2 desktop app for Steam (Windows): release-m2/steam/Meathead2.exe
npm run release:linux    # Meathead 1 Linux desktop app (Steam Machine): release-m1/linux/
npm run release:linux:m2 # Meathead 2 Linux desktop app (Steam Machine): release-m2/linux/
npx tsc --noEmit -p .    # type-check (clean before committing)
```

Voice lines are synthesized offline with [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) and packed into `src/m1/generated/`. Run `npm run voices` after changing any dialogue (see `tools/voices/README.md` for setup). New Meathead 2 lines outside a land's `*_VOICE_LINES` export also need an entry in `tools/voices/m2pack.ts`.

---

## Project layout

```
src/
  m1/                    Meathead (finished)
    App.tsx              Screen flow, progression, weapons, menu input
    constants.ts         Tuning: physics, damage, cooldowns, palettes
    types.ts             Entity/state types
    components/          React UI: HUD, menus, USA map, GameCanvas, cutscenes
    content/             Roster, dialogue, deaths, dossiers
    generated/           Packed voice clips
    game/
      core/              State, the tick, level building, terrain, shared effects
      platform/          Browser plumbing: audio, music synth, speech, input
      player/            Meathead: movement, specials, collision
      combat/            Weapons, projectiles, knockback, status effects
      enemies/           Enemy AI, kinds per stage
      bosses/            Boss AI, arena hazards
      stages/            Hand-built stage layouts: one folder per stage
      render/            Canvas drawing: the play field, particles, lighting

  m2/                    Meathead 2 (runs on Meathead's engine)
    App.tsx              Shell: stage, HUD, prompts, map, weapon switching
    store.ts             Playthrough state (lands cleared, weapons owned)
    timeOfDay.ts         Hour from lands cleared: skies, light
    intro/               The way in: truck, garage, security, street, ticket line
    hub/                 The roundabout map hub
    pen/                 Staff break room (practice)
    adventure/           Jungle Land (8 sections)
    spooky/              Spooky Land
    space/               Future Land
    hollywood/           Hollywood Land
    foreign/             Foreign Lands
    frontier/            Wilderness Land
    fantasy/             Fairy Land
    cartoon/             Cartoon Land
    weapons/             The 9 M2 weapons
    moves/               Grabs (beatdown, shakedown)
    music/               Synth music engine + songs + sound test

tools/
  voices/                Offline voice pipeline
  steam/                 Desktop app packager (Electron + @electron/packager)
  smoke/                 Headless load check (loadcheck.mjs)
  perf/                  Frame-time profiler
```

`release-m1/` and `release-m2/` hold the built HTML files. `release-m2/web/` and `release-m1/web/` are the itch.io folders. `release-m1/steam/` is the Windows desktop build (not in git; too large).
