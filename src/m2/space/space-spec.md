# Future Land (space/): the spec notes

The design the skeleton was built from lives in OWNERSHIP.md and each section's header comment (and the commit log).
This file holds the decisions made since, starting with the encounter pass.

Sections, left to right (geometry.ts): square (cp 0-3), atom (10-14), ride (20-23), drag (30-33), needle (40-41),
orbit (50-54), crater (60-64), queen (70-).

## Decisions log

### 2026-10-21: encounter pass (the user: "some areas seem like they can be mindlessly cleared by walking forward and pressing fire")

Jungle Land's encounter pass (adventure/adventure-spec.md) is the reference. Existing enemy kinds and existing
terrain/hazards only; about the same count, HP and damage; set pieces, scenes, the UFO and the queen untouched. Nobody
placed within the safe start's reach of a checkpoint (spawnSafe.ts SAFE_X 360, SAFE_Y 260).

**The square (square/layout.ts ENEMIES: same kinds, same count)**

- The shops were two robot dogs and a cadet on the street, one after the other. Now a dog alone (slide it), then a
  cadet up on the SPACE FOOD STICKS dome by its health shooting down, with a dog under it at his ankles.
- The second people mover's cadet stood at its far end, 160 from THE PEOPLE MOVER's checkpoint. It's on the belt now,
  carried at him as it shoots down it.
- The cadet past the electric sidewalk stood on its own after it. It's stood in the gap between the second and third
  plates now, shooting at him while he times them (the plates zap it too: shove it onto a live one).
- The robot stood 280 from THE WALL OF TOMORROW's checkpoint: moved on, still alone, the dog after it.
- The monorail's far cadet stood 100 from THE ATOM PLAZA's checkpoint. It's up on the far station's steps now,
  shooting up the beam at him while he walks it between trains.
- Left alone: the guard's teach, the wall's pads, the jetpacker over the pit, the atom plaza (the mix: a belt into a live
  plate, the guard rushing across plates, a cadet on the deck, jetpackers).

**The giant atom (atom/layout.ts CAST: same kinds, same count)**

- The costumed cast were one at a time on the floor, between the rigs, and four of them inside checkpoints' reach (the
  first flag 320 from THE GIANT ATOM's, the second 60 from THE METEOR RIG's, the third 160 from THE AIRLOCKS', the last
  50 from THE LINE's). Now each stands by a rig, where the rig can be turned on it:
  - the thrusters: the first flag just short of the test stand's flame (lure or shove it in), and a flag in the gap
    between the gantry's two blasts, under the rigger's catwalk (wrenches from above, the pole at him, the blasts);
  - the airlocks: a martian and a flag side by side between the first two doors (the spiked antennae punish a dive
    kick, the flag's pole a shoulder charge: the two counters at once), the air cannon blowing them back into the door
    with him; the last flag between the next two;
  - the laser show: a flag in the fog in the floor laser's run, the two martians under the sweep.
- Left alone: the meteors (the floor's all swept: the martian on the crate and the rigger on the perch), the line and
  the hijack (scripted).

**The main drag (drag/layout.ts ENEMIES: same kinds, same count)**

- The monorail's cadet stood 140 from THE LAGOON MONORAIL's checkpoint. It's by the timed pad under the station now,
  shooting at him while he waits on the pad for it to go (or shove it onto the pad: BLAST OFF).
- The street under the googie roofs was a walk-and-fire line (robot, dog, guard, robot), the last robot 140 from SPACE
  NEEDLE 2's checkpoint, and the roofs had only the jetpacker. Two roads with different mixes now: the street a robot
  with a dog at its feet, then the guard; the roofs the other robot up on the health's roof (its live antenna: no dive
  kicking it, fight it up there or go under), the jetpacker over.
- The needle's plaza: the first cadet's up on the observation balcony shooting down (the step pad's way up to its
  ammo goes through him); the guard still rushes across the plates.
- Left alone: the landing, the saucers (nothing about: learn them), the third rail and its trains, the treadmill under
  fire (already a fight against the belt).
