# Jungle Land (adventure/): the spec notes

Jungle Land had no spec of its own (its design lives in each section's header comment and the commit log). This file
holds the decisions made since, starting with the encounter pass.

Sections, left to right (geometry.ts): jungle (cp 0-6), queue (10), river (20-24), dino (30-34), temple (40-43),
cart (50-56), roof (60), clearing (70-71).

## Decisions log

### 2026-10-21: encounter pass (the user: "some areas seem like they can be mindlessly cleared by walking forward and pressing fire")

Kept LIGHT (the user, mid-pass: "it's not really jungle land that really needs it. maybe a little. but it's the best
one i think"): a few of the clearest walk-and-fire stretches remixed, plus moving anybody placed inside a
checkpoint's safe reach (spawnSafe.ts SAFE_X 360). Existing kinds, terrain and hazards only; same HP and damage; set
pieces, scenes and the T. rex / Safari Artie fights untouched.

**The jungle (jungle/layout.ts ANIMALS: 32 before, 32 after)**

- Checkpoint reach only (nudged, same spots otherwise): the way-in frog (1750 to 1490), the grove's second chimp
  (3250 to 2980), the frog past the ravine (4900 to 4760), the overlook's frog (6500 to 5980, ahead of the jaguar),
  jaguar country's frog (8100 to 8450).
- Jaguar country's ground was three animals in a row walking at him. The second jaguar (it stood by THE LAST VINES'
  checkpoint) is up on a canopy branch over the ground way now: it pounces down on him there, and meets him head on
  in the canopy. The canopy's monkey moved off that branch, onto the boa's.
- The last ravine: the first chimp on the far bank is a jaguar now, waiting at the landing. It pounces at him out on
  the vines, over the ravine (hang back on a vine and it jumps into it), or meets him landing. The jaguar taught on
  the overlook, from above in jaguar country, then this.

**The dino park (dino/index.ts ENEMIES: 12 raptors, 2 trikes before; 11, 3 after)**

- The field's second trike stood 150 from THE VOLCANO's checkpoint: moved back (2300 to 2080).
- The last stretch was a pack of three raptors on the ground to walk-and-fire. Now: a raptor on the ground and one up
  the first trees as before, a trike between the trees in front of the last fence (its horns don't take a shoulder
  charge: up a tree out of its way, then over the fence), and the last raptor up the last tree, dropping on him.

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

**The river, under it (river/course.ts PIRANHAS, SNAPPERS: same counts)**

- The swim was a fish here and there to shoot swimming right, the air pockets free, and piranhas or a snapper sat
  inside four checkpoints' reach (UNDER THE RIVER, THE RIDE GRAVEYARD, THE ANIMATRONICS, THE DINOSAUR TANK).
- Now the first air pocket's free (teach the air), and the second and third have a pair of piranhas milling under
  their mouths (the tunnel's roof keeps them below it): clear them to breathe. The third has its snapper under them
  too (low and high at the mouth).
- The first pair's by the rock with the first eel in it (the eel's lunge and the school at once); one piranha is over
  the sunk boat by its stern's eel; one's among the animatronics. All out of the checkpoints' reach.
- Left alone: the boat ride's piranhas (the boat ride and Artie are the set piece), the tank (its guests behind the
  glass), the intake.

**Not touched**

- The queue: its staff are harmless (the joke); nothing to fight there.
- The mine cart: a ride; its threats are the ride's tricks (idols, the serpent, boulders, beams, gaps), already taught
  one at a time and then mixed.
- The roof: a set piece (it comes down), no enemies.
- The clearing: Safari Artie's camp and fight (the guides out of his tent are part of it).
