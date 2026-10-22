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

**The dungeon (dungeon/index.ts CAST: same)**

- The cells were a fork, a shield and a bride on the floor in a row. The fork's up on the first chains' ledge now, over
  the way through (shoot up, or meet him up there: no charging him), the shield on the floor with the bride behind it
  (her rush comes out from behind the lid). Left alone: the stairs, the chamber (the ceiling's the fight), the rope walk.

**The clock tower (tower/layout.ts FOES: same)**

- The climb already fights on its traversal (beams to ram, nets, ledges, a ladder perch over the bell ringer, brides up
  the climbs): little walk-and-fire. One change: floor 4's igor stood 130 from THE TOWER, FLOOR 5's checkpoint, between
  it and the beam. He's across the shaft now beside the wolfman at the climb's foot, the bride over them: the rusher a
  shoulder charge is made for next to the fork that punishes one.
- Left as is: the clock room's igor and bride sit inside THE CLOCK ROOM checkpoint's reach (the room's near half is all
  inside it, and the igor at the main support is the point of the room): spawnSafe leaves them out of a start there,
  and walking up into the room they're there.

**Real hell (hell/index.ts ENEMIES, layout.ts LEDGES: same kinds, same count)**

- The hound run was one hound then two side by side on the flat. Now one, then another by the rock step, and the third
  waits past the first lava puddle: it pounces at him across it (hop back and it comes down in the lava: it cooks).
- The goat stood alone on its flat 280 from THE BRIMSTONE STEPS' checkpoint. It's up on its rock at the flat's end
  now: no charging the horns head-on, so jump over and dive kick it (a tough one up top), or shoot it; it charges to
  the rock's edge at him and pulls up.
- The shore's pack (two hounds, the goat, an imp up on its ledge) stood 115-440 from THE DEMON's checkpoint, in a walk
  at him. They wait right at the lake's landing now (the imp's ledge moved over them): the hounds pounce at him while
  he's still on the last crumbling rock (step back and they're in the lava), the three on the ground in a line (charge
  the first hound into the rest, but not into the goat's horns). Then it's quiet to the refill and the gate.
- Left alone: the pit, the bone yard's imps up their rocks, the bats over the pools, the vents' high-road imp, the lake
  (everything at once already).

**Not touched**

- The control room and the gift shop: the shop's a chase (Donnie ahead, the racks he tips), its staff already up on the
  display tower, the mezzanine and the shelf over the floor's forks. (Its checkout hawker on the display tower sits in
  THE GIFT SHOP checkpoint's reach, behind it: left, spawnSafe leaves him out of a start there.)
- The ballroom: Donnie's fight.

## The demon (hell/demon.ts, lines in hell/demonLines.ts)

BRATHAZAR, Satan's boy, redesigned (the user's: "the spooky land mid boss shouldn't be a fatso but some general large
punk demon eager to impress his dad. make his attacks generally deadlier. remove the trip mechanic on him. he will
have several telegraphs that will need to be read and dodged accordingly, like a dark souls boss or something. his hp
value won't be quite as tanky to make up for the missing trip mechanic on him. he will still tattle to his dad when
defeated. charge moves will still rebound you heavily as well, encouraging you to go for a ranged approach.")

- The look: a tall lanky-strong punk demon kid: green liberty spikes, horns with steel rings and studs, an open
  leather jacket (studded shoulders, circle-A and 666 patches, safety pins), a cut red torso, ripped jeans, a belt
  chain, combat boots, a tail with a spiked collar, piercings, a sneer, a spiked flying-V he swings. Between moves he
  keeps glancing up to see if his dad's watching. Found shredding for nobody (no more lunch).
- No trip. HP 1800 (was 2400 with the trip's ×2.5 window); shots get 70% through (was 55%). Sub-boss rules as before
  (no i-frames, both sides walled in fire till he's beaten, gone for good past DONE_CP).
- Charge moves bounce Meathead way back off him (shoulder charge, slide and uppercut alike); a dive kick bounces him up
  with the power back (chains uncapped). Meathead says so on the 2nd and 5th bounce (MH_BOUNCE).
- The moveset, each with its own tell and an opening after (damage before M2's ×0.65):
  - LEAP: deep crouch, horns going red-hot, guitar up; his shadow marks the landing. Crushed under him 44; a shockwave
    runs along the floor both ways 24 (jump it). Past 60% hurt, 40% of leaps are a feint first (a hop and a laugh,
    DEMON_FEINT), then a quicker real one. Winded 56 frames after.
  - SWEEP: low, guitar dragged behind striking sparks, the floor out front flashing: a floor sweep 34 (jump it).
    Overswing 42.
  - RUSH: head down, horns out, three paws of the floor, arrows along the floor his way: charges the length of the pit
    40 (jump him; he's head-down, under 96 tall; or be on a ledge). Ends horns-first in the fire wall, mohawk alight:
    80 frames open.
  - PILLARS: arm up, then pointing: the floor glows and bubbles (where Meathead stands and ±190, or a row of five
    marching out from him), then hellfire 340 tall (over the ledges) 32. Past half hurt, one more comes up late where
    Meathead went. Then he throws the horns and looks up for his dad: 50 open.
  - BREATH: rears back, chest and cheeks swell, smoke from the nose: hunched, a jet of fire at waist height (30-74 up),
    out to 360: 34 (duck it). Coughs 44 after.
  - COMBO: a step in, guitar cocked, an eye glint: a chest-high swing 22 (duck/back off), a backhand upswing 22 (don't
    jump in), then the guitar held overhead for a varying beat (the long ones with a look up at dad) and a stepping
    smash 46. Stuck in the floor 58 after.
  - Under 40% the wind-ups and openings run ×0.8. Staggers (whining, DEMON_HURT) only when not mid-attack.
- Lines: intro, chatter ("DAD! DAD, ARE YOU WATCHING?!"), show-off on a hit, whining, the feint laugh, the tattle
  (DEMON_BEATEN, then Satan as before): clean/shitty/naked pools, all in demonLines.ts. Every new hurt source has its
  hurt + death lines (guitar, crush, wave, rush, pillar, breath, airbody, bounce-into-fire, bump).
