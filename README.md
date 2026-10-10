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
| Move | A / D or the arrow keys | Left stick / D-pad |
| Aim up / crouch | W / S | Up / down |
| Jump (hold for higher) | Space (or Z, J) | A |
| Fire | Left click (or X, K) | X / RT |
| Secondary fire (weapons that have one) | F | Y |
| Special (see below) | Right click | B / LT |
| Swap weapon | Mouse wheel / 1–9 | LB / RB, or flick the right stick for the weapon wheel |
| Pause (and equip from the arsenal) | Esc / P | Start / Menu |

Special moves (each costs one of your two power cells; they refill over time, and a dive-kick stomp refunds one):

| Move | Keyboard + mouse | Controller |
| --- | --- | --- |
| Shoulder charge (hold to keep going) | Right click, or Shift | B |
| Slide tackle | Down + right click, or C on the ground | Down + B |
| Uppercut | Up + right click, or E | Up + B |
| Dive kick (chain the stomps) | Down + right click in the air, or C in the air | Down + B in the air |

The controller buttons are where Xbox prints them. On PlayStation and Switch pads, the same positions are used, and the prompts show your pad's own symbols. In menus, a Switch pad's confirm and back are its own (A on the right).

## Meathead 2 (in development)

The sequel: Meathead goes to **Happy Land**, a theme park. It runs on the first game's engine and plays the same, with new moves on top. So far there's the way in (the parking garage, park security, the America USA street and the ticket line), the hub with its map of nine lands, the staff break room (a practice room), and the first land, **Adventure Land**, start to finish:

- a real jungle, with vines to swing and climb and monkeys throwing things at you
- the Jungle Cruise (skip the three-hour line), a boat ride with Safari Artie that runs out of gas, and the swim under it (watch your air)
- a fake Jurassic zoo whose dinosaurs get switched to HOSTILE, and the animatronic T. rex sub-boss
- backstage at the Temple of the Jaguar, a runaway mine cart with Safari Artie on your tail, the temple roof caving in
- Safari Artie himself, in the clearing, with his bushes and his stampedes

The time of day moves on as you clear lands, morning to night. Everyone talks, and what they say depends on the state of your pants.

It isn't packaged yet: run it from source (`npm run dev`, then open `localhost:3000/meathead2.html`) or build the single file with `npm run release:m2` (into `release-m2/meathead2.html`).

### Meathead 2's extra controls

Everything above, plus:

| Move | Keyboard + mouse | Controller |
| --- | --- | --- |
| Beatdown: lunge, pin them and punch (every punch heals you) | R, then left or right click to punch, Space to get off | Y + B, then X / B / Y to punch, A to get off |
| Shakedown: grab them by the neck and shake the ammo out, then throw (hold a direction; down slams) | T | Y + X |
| Small critters: snatch one up and throw it (no direction: at the nearest enemy, or forward) | R or T on a critter | Y + B or Y + X on a critter |
| Vines: jump into one to grab it; up / down climb, left / right pump the swing, jump lets go | Move keys, Space | Stick, A |
| On a vine: rush up or down it, hitting what's in the way; or shove a swinging vine | Shift + W / S; Shift | B + up / down; B |
| Mine cart: speed up / slow down, jump, duck | D / A, Space, S | Right / left, A, down |
| Cheat menu (for now: god mode, unlimited ammo, all weapons, pants, time of day, checkpoint skip) | Pause, then click CHEATS | Pause, then X |

In Meathead 2 the left mouse button is the only fire key on the keyboard. Ammo runs out everywhere but the break room; going into a land, or coming back to the hub from a boss, refills it.

## Building from source

You'll need [Node.js](https://nodejs.org).

```sh
npm install
npm run dev              # play it at http://localhost:3000, with the dev cheats on the title screen
npm run release:public   # build the single-file game into release-public/Meathead.html
npm run release          # the same, with the dev cheats left in (release/, not tracked)
npm run lint             # type-check
npm run release:m2       # Meathead 2, single file, into release-m2/ (not tracked); in dev: localhost:3000/meathead2.html
                         #   (dev only: ?adv=<checkpoint> starts in Adventure Land there; ?tod=<0-9> sets the time of day)
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
    App.tsx              The shell: the stage, the HUD, the prompts, the map, weapon switching
    PauseMenu.tsx        The pause menu (the arsenal, the cheat panel); hudThemes.tsx dresses it and the HUD per place
    input.ts             Its own buttons: the grabs' chords, the menu buttons
    store.ts             What the game tells the UI, and the playthrough (lands cleared, weapons owned)
    cheats.ts            The cheat panel's settings (for now)
    timeOfDay.ts         The hour, from lands cleared: skies, sun and moon, the light
    kinds.ts             Registering its own enemies with the engine
    victory.ts           A boss kill's VICTORY, stamped on letter by letter
    walkAway.ts          After a boss: him walking away from the carnage with his new weapon (walkAway/: per boss)
    intro/               The way in: the truck, the garage, security, America USA, the ticket line
    hub/                 The hub: the roundabout (index.ts), its art (draw.ts), the lands, the map card
    pen/                 The staff break room behind the STAFF ONLY door: practice
    adventure/           Adventure Land, a folder per section (jungle, queue, river, dino, temple, cart, roof,
                         clearing): each one's layout, enemies, set pieces, art and lines
    weapons/             Its nine weapons (ray gun, souvenir launcher, soul sucker, flintlock, spellbook,
                         clapperboard, mallet, spawner, crossbow)
    moves/               The grabs (the beatdown and the shakedown) and their callouts
    cast/, lines/        Its people, and keeping what's said consistent with Happy Land
    roster.ts            The enemies it has (the voice pack is built for these)
    generated/           Its own voice pack (a cut of Meathead's)
tools/
  voices/                The offline voice pipeline (extract lines, synthesize, pack; m2pack.ts for Meathead 2's)
  m2Stub.ts              Meathead 2's build: leaves Meathead's own stages, bosses and cutscenes out
```

`GameCanvas` owns the fixed 60fps loop. Each tick it builds a `FrameContext`, calls `stepGame`, draws with `drawWorld`, and reports health and ammo back to React for the HUD.
