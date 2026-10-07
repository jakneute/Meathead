# MEATHEAD

**What if Mega Man's special weapons didn't suck?**

Meathead is a 16-bit-style run-and-gun about a man who lives for chest day and hates everything else. A government department that doesn't exist walks into his gym and hands him a list of eight supervillains. He doesn't care why. He kills them, takes their weapons, and turns those weapons on whoever's next.

Fly to Anchorage, Hilo, San Francisco, Miami, Flint, New York City, Houston and Albuquerque. Wreck everyone between you and the boss. Body-check fools off cliffs, uppercut them into ceilings, dive-kick them into the floor and chain the stomps. Kill the boss, and its weapon is yours:

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

Every boss has a weakness, and every weapon has a job beyond doing damage. Every stage has its own set pieces, and the bosses die ugly.

> **Content warning:** cartoon gore, constant profanity, toilet humor and crude sexual jokes. Not for kids.

## Play it now

You don't need to install anything. The whole game is one HTML file.

1. Download [`release-public/Meathead.html`](release-public/Meathead.html). On that page, use the **Download raw file** button.
2. Double-click it. It opens in your web browser and plays, and it works offline.

Notes:
- **Browser:** use a desktop browser. Chrome and Edge are tested; Firefox should work.
- **Controllers:** Xbox, PlayStation and Switch controllers work. Plug one in and press a button. The on-screen prompts switch to whatever you touched last.
- **Saving:** progress isn't saved yet. Closing the tab ends your run.

## Controls

| Action | Keyboard + mouse | Controller |
| --- | --- | --- |
| Move / crouch | WASD / arrow keys | Left stick / D-pad |
| Jump | Space | A |
| Fire | Left click | X / RT |
| Secondary fire (weapons that have one) | F | Y |
| Special | Right click | B / LT |
| Swap weapon | Mouse wheel / 1–9 | LB / RB, or the right stick for the weapon wheel |
| Pause | Esc | Menu / Start |

Special moves:

| Move | Keyboard + mouse | Controller |
| --- | --- | --- |
| Shoulder charge | Right click / Shift | B |
| Slide tackle | Crouch + right click / C | Down + B |
| Uppercut | Up + right click / E | Up + B |
| Dive kick | Down + right click in the air / C in the air | Down + B in the air |

The controller buttons are where Xbox prints them. On PlayStation and Switch pads, the same positions are used, and the prompts show your pad's own symbols.

## Building from source

You'll need [Node.js](https://nodejs.org).

```sh
npm install
npm run dev              # play it at http://localhost:3000, with the dev cheats on the title screen
npm run release:public   # build the single-file game into release-public/Meathead.html
npm run release          # the same, with the dev cheats left in (release/, not tracked)
npm run lint             # type-check
npm run release:m2       # Meathead 2, single file, into release-m2/ (not tracked); in dev: localhost:3000/meathead2.html
```

The voices are synthesized offline with the [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) text-to-speech model and packed into `src/m1/generated/voices.bin`. You only need to run `npm run voices` if you change dialogue, and that needs the setup in [`tools/voices/README.md`](tools/voices/README.md).

All the art is drawn in code on a canvas, and the music and sound effects are synthesized in the browser. There are no image or audio asset files.

## Project layout

```
index.html               Meathead (src/m1)
meathead2.html           Meathead 2 (src/m2), in development
src/
  m1/                    Meathead
    App.tsx              Screen flow, progression, weapons, menu input
    build.ts             PUBLIC_BUILD: the public build drops the cheats and always plays the intro
    types.ts             Shared entity/state types
    constants.ts         Tuning: physics, damage, cooldowns, palettes
    components/          React UI: HUD, menus (Overlay + pieces), USA map, GameCanvas, cutscenes
    content/             Words and data: roster (bosses, locations, weapon unlocks), dialogue, deaths, dossiers
    generated/           The packed voice clips
    game/
      core/              The simulation's spine: state, FrameContext, the tick (update), level building,
                         terrain, shared effects (particles, damage numbers, pickups, Meathead's voice)
      platform/          Browser plumbing: synthesized audio and music, speech, keyboard/mouse/gamepad input
      player/            Meathead: input gating, movement, special moves, collision
      combat/            Weapons, projectiles, muzzles, darts, knockback, status effects
      enemies/           Regular enemy AI and contact, special kill animations
        kinds/           Themed enemies per stage
      bosses/            Boss registry and rules, each boss's AI, arena hazards
      stages/            Hand-built stage layouts, one folder per stage: course, runtime, set pieces, drawing, and
                         the stage's own cutscenes and kill cameras (name.ts for the logic, nameDraw.ts for the art)
      scenes/            Cutscenes that aren't one stage's, logic and art side by side
        art/             Shared art kits: snes.ts (the 16-bit look), ink.ts (the inked gross-up look)
      garage/            Meathead's garage: the souvenirs, the room, the close-ups
      render/            Canvas drawing for the play field: world.ts (the frame), particles, projectiles, lighting
        player/          Meathead, his special-move poses, gore, sprite outlines
        enemies/         Themed enemy sprites and their death animations
        bosses/          Boss sprites, arenas, corpses, boss-specific props
        backdrops/       Parallax skies and terrain textures
      music.ts           What's playing when (the cues); the synth itself is in platform/music
      range.ts           The firing range (after a boss, and the garage's practice range)
  m2/                    Meathead 2: runs on Meathead's engine (src/m1/game), its stages registered at startup
    App.tsx              The shell: the stage, the HUD, the prompts, the map
    input.ts             Its own buttons: the grabs' chords, the menu buttons
    roster.ts            The enemies it has (the voice pack is built for these)
    store.ts             What the game tells the UI (the map, the prompts, where to go)
    hub/                 The hub: the roundabout (index.ts), its art (draw.ts), the lands, the map card
    pen/                 The test pen behind the STAFF ONLY door
    moves/               The grabs (the beatdown and the shakedown) and their callouts
    lines/               Keeping what's said consistent with Happy Land
    generated/           Its own voice pack (a cut of Meathead's)
tools/
  voices/                The offline voice pipeline (extract lines, synthesize, pack; m2pack.ts for Meathead 2's)
  m2Stub.ts              Meathead 2's build: leaves Meathead's own stages, bosses and cutscenes out
```

`GameCanvas` owns the fixed 60fps loop. Each tick it builds a `FrameContext`, calls `stepGame`, draws with `drawWorld`, and reports health and ammo back to React for the HUD.
