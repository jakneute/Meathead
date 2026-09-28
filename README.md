# Meathead

A 2D side-scrolling shooter. Play as Meathead, a beefy hero who steals enemy weapons and body checks fools.

## Running

Requires Node.js.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # production build in dist/
npm run lint     # type-check
```

## Controls

| Action | Keyboard / mouse | Gamepad |
| --- | --- | --- |
| Move | WASD / arrows | Left stick / D-pad |
| Jump | Space / Z / J | A |
| Fire | Left click / F / X / K | X, Y, RT |
| Shoulder charge | Shift / C | B, LT |
| Uppercut | Up + charge | Up + B |
| Divekick | Down + charge (in the air) | Down + B |
| Cycle weapon | Q / E / mouse wheel | LB / RB |
| Pause / arsenal | Esc | Start |

## Project layout

```
src/
  App.tsx                Screen flow, progression, weapons, menu input
  types.ts               Shared entity/state types
  constants.ts           Tuning: physics, damage, cooldowns, palettes
  components/            React UI: HUD, menus (Overlay + pieces), USA map, GameCanvas
  content/               Words and data: roster (bosses, locations, weapon unlocks), dialogue, dossiers
  game/
    core/                The simulation's spine: state, FrameContext, the tick (update), level building,
                         terrain, shared effects (particles, damage numbers, pickups, Meathead's voice)
    platform/            Browser plumbing: synthesized audio, speech, keyboard/mouse/gamepad input
    player/              Meathead: input gating, movement, special moves, collision
    combat/              Weapons, projectiles, muzzles, darts, knockback, status effects
    enemies/             Regular enemy AI and contact, special kill animations
      kinds/             Themed enemies per stage (index: Artie's + shared helpers; hector, victor, ernie, dale)
    bosses/              Boss registry and rules, each boss's AI, arena hazards
    scenes/              Victory lap and easter eggs (the sewer nuke, the corked volcano)
    stages/              Hand-built stage layouts, one folder per stage (course, runtime, set pieces, drawing)
    render/              Canvas drawing: world.ts (the frame), particles, projectiles
      player/            Meathead, his special-move poses, gore, sprite outlines
      enemies/           Themed enemy sprites (per stage) and their death animations
      bosses/            Boss sprites, arenas, corpses, boss-specific props
      scenes/            Victory, easter egg and ending art
      backdrops/         Parallax skies and terrain textures
```

`GameCanvas` owns the fixed 60fps loop. Each tick it builds a `FrameContext`, calls `stepGame`, draws with `drawWorld`, and reports health/ammo back to React for the HUD.

Dev cheats (god mode, all weapons, skip to boss, etc.) are on the title screen; turn them off with `SHOW_CHEATS` in `src/App.tsx`.
