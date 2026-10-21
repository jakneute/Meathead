# The Iron Pit: Meathead 2's opening (spec and decisions)

Code: `src/m2/intro/gym/` (index.ts runs it; course.ts lays it out; scene.ts plays the cutscenes, shots.ts paints
them; gman.ts the G-men; obstacles.ts the things to pulverize them with; art.ts the gym; GymTips.tsx the lesson
cards; lines.ts every line). Music: `src/m2/music/songs/gym.ts` ("Iron Pit").

## The user's brief (2026-10-20), verbatim

"meathead is exercising in his gym. his own place from the first game. it's - i dunno - leg day or something. the G-men come to his home and drop off a supply of protein he wanted. they act as a personal courier service. the whole public think he's held at Guantanamo bay for killing the president in the last game. he's actually being held in secret as a government asset because how good he is at killing people. meathead gets pissed for getting interrupted during leg day and says he must destroy them.

put in a similar tutorial stage as the first game. make sure all the various souvenirs you can get in meathead 1 show as background objects as an easter egg. no shield pushing tech is taught because shield enemies are fairly rare in this game. standard shoot, charge, uppercut, leg sweep, dive kick along with new obstacles for meathead to pulverize the G-men with. they don't attempt to fight back though.

eventually at the end you come across two G-men at the ring from the first game. one is on a jetpack and one is on the ground. they teach you the new grab moves you can do and have you test on them. they cannot die. beatdowns will have them push you off eventually. they are heavily padded, both of them. this is where the new mechanics are taught. heading towards the exit sign pointing right will end the intro stage.

another G-man comes through the door. cut to cutscene. meathead is enraged "you guys keep interrupting my sets. give me someone to kill or i pop your head off like a cork". the G-man he is choking out says they have no active contract right now. meathead's arm tightens up further, ready to pop this guys head off. then the G-man pulls out an all day ticket to happy land as a means of satiating him. meathead turns into an overexcited toddler with this offer and instantly forgets the homicidal violence he was about to commit. the agents offer him a new 'government issued truck' to help get him there. this makes meathead extra giddy. "let's go to happy land!" the game then cuts to him crashing it into a pillar like it does currently and the game begins."

Added asks:
- "in the cheat client, you can skip this stage from the pause menu."
- "the meathead 1 souvenirs are spread out too, not all bunched together like the first game"
- "as a result of the new tutorial stage, don't show tutorial messages for the security guards anymore"

## The flow

New game (title, START GAME) -> the Iron Pit (stage `M2 Iron Pit`): opening cutscene -> tutorial rooms -> the ring ->
the exit -> closing cutscene -> `goTo('intro')`: the existing way in, truck into the pillar first. CONTINUE goes to the
hub as before (saves are only made at the hub and on a land cleared, so a save made after the intro never sees it).
Dying in the gym (only the gut's third blowout can do it) puts him back at its start, no opening again.

## Decisions (where the brief was open)

- **Cutscenes in the stage**, not a React overlay: 256 x 144 SNES pictures blown up 3x, the words under them only
  while the line plays (unrecorded lines: shown as text for a while), no talk-over (each beat waits for its line to
  end), SKIP skips the lot. HUD hidden from frame one (introCutscene).
- **The Guantanamo cover story is told on the gym's TV**: the news ("Day four hundred at Guantanamo Bay for Meathead,
  the man who killed the President." / "Sources say he cries himself to sleep.") over him squatting happily; then the
  G-men say it outright ("Officially you're rotting in Guantanamo, so sign it Guantanamo." / "Uncle Sam doesn't lock
  up his best killer. He feeds him.").
- **The courier G-man is Meathead 1's agent** (his close-up, his voice `agent`), with a partner (a woman, her own
  close-up, voice `m2.gmanf`). The tutorial G-men are seeded variants (men and women, every skin, builds, hair).
- **The gym is Meathead 1's** (its wall, props and plyo boxes reused from `m1/game/stages/gym/draw.ts`, now exported),
  laid out longer, with its ring from Meathead 1's garage range (posts, sagging ropes, MEATHEAD'S G M on the apron).
- **Rooms** (teach, then escalate within each): shoot (couriers in the open, then two behind a tub stack), charge (a
  human wall, then two huddled at the dumbbell rack), slide (crawlers under a knee-high duct; the kettlebell rack
  bowls them over), uppercut (two up on shelves; the cable machine), dive kick (off the mezzanine onto a huddle; the
  bench catapult), mix. The duct: only a slide tackle gets him under it (he can't crawl or crouch-walk: the user's), and
  a slide that runs out under it carries him on out the far side; walking into it, he's stopped.
- **G-men arrive in view** (the user's): each room's lot drops in through the ceiling tiles (dust first, then one after
  another) once all of them would be on screen; nothing off the screen is hit by a flung body, a falling rack's
  pieces, a rolling kettlebell, and obstacles off the screen don't break.
- **Obstacles** smash on a shot (two), any of his charge moves, or a body flung into them; the pieces (tubs,
  dumbbells, kettlebells, plates) kill G-men they hit fast.
- **No shield lesson, no checkpoints** (it's short and nothing can hurt him: noContactHurt).
- **The ring**: grabs taught in order BEATDOWN, SHAKEDOWN, AIR GRAB, each done when performed on a trainer. After 6
  punches the trainer shoves him off (the grab's own jump-off plus a shove back). Trainers can't die: health kept at
  9999 over a max of 60 (so the grabs' damage shares stay small), revived if anything blows them away. The jetpack one
  hovers over the ring and flies back up after he's slammed.
- **The exit** is chained shut till the three grabs are done (the door reads shut); then EXIT lights with its arrow.
- **Closing**: the arrival wide, the chokehold close-up (his LEFT arm round the neck; three squeeze stages: the arm
  higher, the face red then purple), the ticket insert, the toddler (his own close-up gone to mush: huge shining eyes,
  blush, bouncing, hearts), the agent dangling the truck keys, giddier, "LET'S GO TO HAPPY LAND!". Lines by his state:
  the G-man's and the agent's lines change if he's shit himself or is naked; flies on him in every shot then.
- **Cheats build**: SKIP STAGE in the pause menu (where SKIP INTRO is in the way in) jumps to the closing cutscene,
  not past it (the cutscene is the payoff and is skippable itself).
- **Souvenirs**: all 24 of Meathead 1's (m1 content/garage.ts) scattered the length of the gym: hung on the walls, on
  little wall shelves, on the floor, by the lockers and the ring. Drawn with the garage's own art (`drawSouvenir`).
- **The way in's lesson cards** (security's "postal" rules and the grabs sheet) are gone; only the ticket line's count
  stays (it's not a lesson).
- **Music**: a new song, "Iron Pit" (E minor, 152, a Mega Man weight room), main and a soft cutscene arrangement.
