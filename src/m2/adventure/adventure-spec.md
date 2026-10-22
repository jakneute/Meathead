# Jungle Land (adventure/): the spec notes

Jungle Land had no spec of its own (its design lives in each section's header comment and the commit log). This file
holds the decisions made since, starting with the encounter pass.

Sections, left to right (geometry.ts): jungle (cp 0-6), queue (10), river (20-24), dino (30-34), temple (40-43),
cart (50-56), roof (60), clearing (70-71).

## Decisions log

### 2026-10-21: encounter pass (the user: "some areas seem like they can be mindlessly cleared by walking forward and pressing fire")

Existing enemy kinds and existing terrain/hazards only; about the same count, HP and damage; set pieces, scenes and
the T. rex / Safari Artie fights untouched. Nobody placed within the safe start's reach of a checkpoint (spawnSafe.ts
SAFE_X 360).

**The jungle (jungle/layout.ts ANIMALS: 32 animals before, 32 after)**

- The grove's ground way was a walk-and-fire line (chimp, frog, chimp, each alone in front of him), and its second
  chimp stood 100 from THE RAVINE's checkpoint. Now: a chimp right under the canopy's first monkey (aiming ahead and
  up at once), then a frog and a chimp together (the frog too low to shoot standing, the chimp leaping: low and high).
  The way-in frog that sat by THE MONKEY GROVE checkpoint moved up into the canopy, on the branch with the health.
- The ravine's rest rock was free. A chimp's on it now (it can't leap off the rock): shoot it from the vine, skip the
  rock, or land and shove it off into the ravine. Past it, the two frogs side by side (one slide takes both); the
  second one was inside THE CLIFF's checkpoint's reach.
- The overlook: the frog that sat by THE GORGE's checkpoint is now just ahead of the first jaguar (the low critter
  and the pounce at once).
- Jaguar country's ground was three animals in a row walking at him, with a frog by its checkpoint and a jaguar by
  THE LAST VINES'. Now the second jaguar's up on a canopy branch over the ground way: it pounces down at him from above
  on the ground, and meets him head on up in the canopy. The canopy's monkey moved under the boa (the boa and the
  monkey's throws on one branch). The frog's out with the ground jaguar and chimp.
- The last ravine: the first chimp on the far bank is a jaguar now, waiting at the landing. It pounces at him out on
  the vines, over the ravine (hang back on a vine and it jumps into it), or meets him landing. Taught on the
  overlook, then from above in jaguar country, then this.
