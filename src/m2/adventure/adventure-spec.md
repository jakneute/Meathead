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

**The dino park (dino/index.ts ENEMIES: 12 raptors, 2 trikes, 5 pteros before; 10, 4, 5 after)**

- The trike field: two trikes on the ground, the boardwalks over them free; the second trike stood 150 from THE
  VOLCANO's checkpoint. Now the first trike's alone by the low boardwalk (teach: up out of its way), and a raptor's up
  on the high boardwalk over the second trike's run (the way up isn't free; it drops in on him while the trike paws).
  The second trike is back out of the checkpoint's reach.
- The gift shop's ground way was two raptors in a row. The second is a trike now: down off the shop's roof, a raptor
  (shove it) and a trike's charge (its horns don't take a shoulder charge: shoot it or get up out of its way, the
  monorail's ledge right there). The monorail way keeps its raptor.
- The last stretch was a pack of three raptors on the ground to walk-and-fire. Now: a raptor on the ground and one up
  the first trees as before, a trike between the trees in front of the last fence (up a tree out of its way, then over
  the fence), and the last raptor up the last tree, dropping on him from above.

**The temple backstage (temple/layout.ts ACTORS, GUIDES: 5 warriors before; 5 warriors and 1 guide after)**

- Three of the five warriors stood on or next to a checkpoint's spot (70 from THE DART TRAP's, 250 from SMOKE AND
  MIRRORS', 200 from THE LOADING STATION's): ground-level spear-carriers walking at him, shot down walking right.
- The catapult: the warrior from between the runs is now on the low scaffold over the boulders' run (the high one
  keeps its own). Low enough that he comes down after him into the run: shove or kick him into a boulder (they bowl
  enemies over too).
- Smoke and mirrors: the warrior by the fog, at the scaffold's foot, and up on its first step one of Safari Artie's
  junior guides, sent round the back after him (Artie knows he's in there: he's on his tail all the way through the
  mine cart). The spear punishes a shoulder charge, the spiked hat punishes a dive kick: the two counters side by
  side, the first time in the land they meet. The guide's out of the snake's reach, but up the scaffold after him he
  can be knocked into it. (Clearing: the tree waits on the clearing's own guides only, `liveGuides` by x, so one left
  alive back in the temple can't hold up the kick.)
- The station: the last warrior's up on the queue's rail, down on him from there, not stood by the checkpoint.
