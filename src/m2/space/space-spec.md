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
