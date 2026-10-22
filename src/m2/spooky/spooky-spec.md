# Spooky Land (spooky/): the spec notes

The design the skeleton was built from lives in OWNERSHIP.md and each section's header comment (and the commit log).
This file holds the decisions made since, starting with the encounter pass.

Sections, left to right (geometry.ts): town (cp 0-3), castle (10-14), dungeon (20-23), tower (40-47), hell (50-53),
control (60-62), ballroom (the boss).

## Decisions log

### 2026-10-21: encounter pass (the user: "some areas seem like they can be mindlessly cleared by walking forward and pressing fire")

Jungle Land's encounter pass (adventure/adventure-spec.md) is the reference. Existing enemy kinds and existing
terrain/hazards only; about the same count, HP and damage; set pieces, scenes, the demon and Donnie untouched. Nobody
placed within the safe start's reach of a checkpoint (spawnSafe.ts SAFE_X 360, SAFE_Y 260).

**The town (town/layout.ts ENEMIES: same kinds, same count)**

- The long straight was two wolfmen on the flat one after the other (walk right, shoot), with a rat 110 and the first
  wolfman 300 from THE KIDDIE RIDES' checkpoint. Now it's quiet off the checkpoint, then a wolfman with the rat at his
  feet (the rush and the ankle-biter at once: jump the one, slide the other), and the second wolfman up at the top of
  the ADA ramp, running down it at him as he climbs (the cat and the crow on the terrace behind him).
- Left alone: the plaza and the street (bats, a crow, rats, ghosts, already over and around the gallows and balconies),
  the monster alone by the hearse (the bruiser's teach), the rides (their riders and flyers are the set pieces), the
  drop tower's two roads, the arcade's skeleton (no jumping him under that roof), the stairs (the pumpkins).

**The castle (castle/layout.ts CAST: same kinds, same count)**

- The kitchen was three forks on the floor one after the other, the first 80 from THE KITCHEN's checkpoint. Now the
  first is between the two stoves, on its own (shove it onto a burner when it flares: the stoves sear the cast too);
  the second's up on the pot rack by its health (out of sight from the floor: he meets it climbing up off a stove top,
  where he can't charge it, or shoots up at it); the third's still under the witch on her cauldron (low and high).
- The library was three spiked helmets on its floor in a row. Now one on the floor under the shelves (the dive-kick
  tease, taught), one up on the reading balcony at the top of the first ladder (Spooky's ladders: shoot him from the
  ladder, or come off it into his sword), and the last by the far bookcase (its books hit him too).
- Left alone: the foyer's lone shield (the teach), the dining room's shields (shots bounce off them anyway; the table
  and the chandeliers are the play), the bedroom's brides (scripted out of the wardrobes and the bed), the nursery's
  flyers over the ball pit, the gallery's mummy alone then everything at once.
