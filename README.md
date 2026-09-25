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
  App.tsx              Screen flow, progression, weapons, menu input
  types.ts             Shared entity/state types
  constants.ts         Tuning: physics, damage, cooldowns, palettes
  stages.ts            Boss roster, locations, arena colours, weapon unlocks
  dialogue.ts          Every voice line
  components/          React UI: HUD, menus (Overlay + pieces), USA map, GameCanvas
  game/
    state.ts           GameState shape and reset helpers
    context.ts         FrameContext passed to every system each tick
    update.ts          One simulation tick: status dispatch + system order
    systems/           player, enemies, projectiles, hazards, status effects
    boss.ts            Boss AI, weaknesses and damage rules
    weapons.ts         Firing each weapon, oil rocket / nuke explosions
    level.ts           Stage layout, enemy placement, respawn
    effects.ts         Particles, damage numbers, pickups, Meathead's voice
    audio.ts           Synthesized sound effects (Web Audio)
    speech.ts          Speech synthesis voices
    input.ts           Keyboard/mouse/gamepad -> Controls
    gamepad.ts         Cross-browser gamepad helpers
    render/            Canvas drawing: world, player, bosses, boss arenas
```

`GameCanvas` owns the fixed 60fps loop. Each tick it builds a `FrameContext`, calls `stepGame`, draws with `drawWorld`, and reports health/ammo back to React for the HUD.

Dev cheats (god mode, all weapons, skip to boss, etc.) are on the title screen; turn them off with `SHOW_CHEATS` in `src/App.tsx`.
