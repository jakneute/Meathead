# Hollywood Land: the spec (for every section owner)

Read this, then `OWNERSHIP.md` (who owns what, the shared files, the length budget), then your sections' index.ts
headers. Study how Adventure, Spooky and Space Land's sections are built (src/m2/adventure, spooky, space) and reuse
what they share (adventure/section.ts helpers, the time of day, signLetters, pickLine, the grab, victory, walkAway).

## The user's design (verbatim)

> we start on Hollywood blvd, or at least a cheap imitation of it. various stars on the ground as costumed people approach you to try to get photographs and money from you, like the real Hollywood blvd. respond with violence. like Marilyn Monroe, elvis, etc. fairly standard platforming palette until it gets more interesting. eventually you arrive at the first outdoor roller coaster attraction: thrones of the stars. it is an absurdly huge and absurdly impossible roller coaster with many loops and twists and looks like a planet coaster monstrosity. here's how it works:
> you enter the ride. like all others meathead just callously skips the line and hops in the seat. this isn't a tracked ride where you control meathead, it's a ride with 'stops'. show meathead go through various loops ,twists, turns even maybe the 'suicide coaster' section where you go through increasingly smaller loops in order. there are three sequences. when you stop at a section. there's a toilet. not just any toilet. a toilet a famous person shat in. there are three separate stops, each one gets more grotesque than the last. when the ride stops a bunch of employees get out and try to kill you, the line cutter. you gotta kill them all before you can hop on the throne ride again and it zips you through an increasingly crazy series of loops - which meathead loves and doesn't get nauseous over. it's a start/stop coaster showpiece ride making fun of overt celebrity worship, obsessing over little things like where they took a shit. at the third stop, after killing all the cast members, there's a sleeping guy in a control booth next to a lever. you flip it to 'experimental' mode. the next time you get on the train launches you off the track and into a warehouse whose walls all come down when you burst through.
> what is going on in the warehouse? why, they are covertly filming the next big superhero teamup movie there in secret for tax write off purposes! since the walls came down, the whole public now knows and the secret is ruined. cast members are pissed. go through various green screen sets fighting off a film crew in a platforming sequence. at the end of the sequence is the script for the movie - in glass case - protected like a fucking Indiana jones artifact. before you can get closer, all the principal cast members are there and there are dozens of them in this big stupid teamup movie. like avengers doomsday, but they are called the 'revengers'. the sub boss is called 'the ensemble cast' and there are dozens of low hp goons you need to kill, all distinctly looking and all of them A list actors that you are murdering one by one. when you finally kill them all meathead just kicks the glass case of the script and its pages go flying everywhere for the onlookers to grab, leaking the script and arguably the most devastating thing meathead has done.
> go through another Hollywood themed outdoor platforming sequence until you enter a ride called "disaster: the ride". it's a lame ass ride where you stand in a room in front of a video screen as various disasters play and the room shakes, cools, warms up depending on the disaster showing on screen. the narrator goes in loops like "here's an earthquake", room lightly shakes. "here's a volcano" - room gets marginally warmer. "here's a tornado" - fans go on. "here's a blizzard" - air conditioner gets turned on a bit more. in this section there's another control booth with another sleeping cast member. there's another lever that says "real disasters (experimental)", this causes actual catastrophe.
> go through another platforming sequence with high winds, lava rivers, crumbling buildings and basically every natural disaster happening at once. there's a section where you need to climb upwards because of flooding as various buildings get demolished. it's a forced forward momentum part. there's a tornado chasing you and if it hits you, you die. gotta take cover at locations where snow avalanches occur. just a total juxtaposition of all disasters at once. at the end, the tornado catches up to you and flings you. if you died previously to the tornado meathead breaks the fourth wall and goes "normally you kill me, but because this is a cutscene i just move to the next scripted set piece. okay. makes perfect sense."
> you eventually get flung into a set for a Hollywood stunt show called "stuntman steve's stupendous stuntery" a washed up cliff booth type who did dangerous stunt work for various canon type films in the 80s. now he just does unimpressive stunts like sidestepping out of the way of oncoming cars. he still has his balls but he lost his athleticism. stuntman steve's presence is foreshadowed many, many times throughout the stage. fliers everywhere advertising the show. it's like the park feels like its their crown jewel of an attraction because some guy's face briefly was seen in a few frames of a theatrically released film once.
> will get to the fight mechanics later, but it takes place on the stunt stage against stuntman steve.

## Theming (every section)

Happy Land's cheap parody of Hollywood-themed theme park lands (Universal Studios Hollywood, Disney's Hollywood
Studios), never their names or looks:

- Plywood facades with visible bracing (walk past one and see the 2x4s and sandbags behind it).
- A "studio backlot" where nothing's been filmed in decades (except the warehouse, secretly, for taxes).
- A cheap HAPPYWOOD hill sign with a fallen letter (the second O lies down the slope; section.ts `happywoodHill`,
  matching the hub's hill sign in hub/draw.ts).
- Walk of Fame stars for nobodies and things: THE GUY WHO SAID 'CUT' ONCE, a stunt dog's understudy, a blank
  YOUR NAME HERE $49.99.
- "AS SEEN IN" brass plaques on mundane objects (a bench, a trash can, a hydrant) behind velvet ropes, guests
  photographing them.
- Franchise fatigue: knock-off franchise banners, absurd sequel numbers, COMING SOON for old things, Revengers merch
  carts.
- The Revengers' tagline (the user's): **"REVENGERS: RESEMBLE"**, a stupid, nonsensical line, and that's the point. It
  goes on every Revengers banner, poster, merch cart and bit of franchise signage (and in lines where it fits).
- The old studio-tour attractions done badly.
- PHOTOS $20 hustlers and tip jars; exit through the gift shop.
- Stuntman Steve fliers, posters, standees and PA plugs everywhere (section.ts `steveFlier`).
- Legally distinct parody names, no real logos. Celebrities and actors are legally distinct parodies.

## Standing rules

- **Prototype first pass:** crude readable art but FULL game feel (set pieces, obstacles, layout, enemies);
  peak-SNES later.
- **Fill in the unspecified; follow exactly where specific.**
- **Enemies:** all-new kinds (no Meathead 1 kinds); human enemies mixed (women too, skin tones, builds, hair; seeded
  variants). Celebrities/actors are legally distinct parodies.
- **Sub-bosses must die:** once active, both sides lock till it dies; open before; never respawned once past.
- **Every M2 boss/sub-boss:** clean / shitty-pants / naked line pools for every line group, intro to death.
- **Dialogue:** blunt, short, vulgar, specific; talk less; fit the trigger; no line twice in 45 s (pickLine,
  speech.ts); speech text only while spoken; subtitles whole on screen (saidOver clamps); no talk-over; cutscene skip
  is all-or-nothing; HUD hidden in cutscenes (inCutscene); HUD clear zone (topBand()).
- **Any new way to hurt Meathead** gets voiced hurt lines + death lines.
- **Hazards and rides hurt enemies too;** enemies are never placed or idle in them (they can be knocked in).
- **M2 revisits differ;** destruction never locks the way back. Checkpoints restore world state.
- **Fake 3D:** one shared eye per scene, straight walls, no depth layer over nearer things, cull by on-screen position
  (no pop-in), perspective sides, bent ground plane, parallax.
- **Standable reads standable** (lit top lip; look-alikes dimmed); **impassable reads impassable.**
- **Signs:** readable (nothing over them), physically held up / diegetic, themed lettering (src/m2/signLetters.ts,
  space/square/lettering.ts), not the stock font (the skeleton's postSign placeholders are the exception, to replace).
- **Drops and damage:** M2 lean drops, damage taken x0.65; boss/sub-boss durability as the other lands (main bosses
  666 HP, 60-frame breather, non-weakness 35%; sub-bosses no i-frames, big HP); a big health + ammo refill before the
  boss door (and before the sub-boss).
- **American English** (spelling, units).
- **Time of day:** outdoor sections return `outdoors: () => 1` and draw drawTodSky (placeholderBackdrop does); the
  hour follows lands cleared.
- **Process:** no screenshots, no headless sims (the user plays on the same PC); typecheck (`npx tsc --noEmit`);
  rebuild with `npm run release:m2` after changes.

## Per-section briefs

### Outdoors: blvd (0-9) and lot (30-39), and the stunt wires

**Stunt wires first.** The land's one new traversal mechanic (Adventure: vines; Spooky: ladders). A harness hangs off a
rig (a boom arm, a gantry, an overhead track). Touch/grab the harness: the rig reels him along and up toward `to`, he
swings under it (momentum from his input), jump to let go (flung off the swing's speed), or he's let go at the end.
Readable: the rig's track drawn, the harness glowing a little, slack when `off`. Build it in `hollywood/wires.ts` (any
engine hook it needs, append minimally) so every section's `wires()` just works. Enemies can be on wires too (a grip
riding one at him) if it fits.

**Blvd** (~11500 px, ~2.3 min): the cheap Hollywood Blvd. Walk of Fame stars in the pavement (readable joke names),
plywood fronts (a legally distinct movie-palace knock-off, its cement handprints of nobodies), AS SEEN IN plaques with velvet ropes. Enemies: costumed impersonators (a Marilyn-ish blonde whose dress
blows up as an attack, an Elvis-ish hip-shaker, a caped superhero knock-off, a pirate-captain knock-off, a gold-painted
"living statue" who stays still till he's close), each wanting PHOTOS $20 / a tip: they block, grab, and pickpocket
ammo if he lets them; "respond with violence". Teach the wires: one harmless over a planter, one over a gap (a
sinkhole in the star pavement), one under fire. Stuntman Steve's first standee early, fliers on every pole.
Fairly standard platforming until it gets more interesting: a short climb up a facade's scaffold, a tour tram passing
on its route (it hurts enemies too), into the queue plaza of THRONES OF THE STARS at the end.

**Lot** (~9000 px, ~1.8 min): the studio backlot, nothing filmed in decades. Facade streets one plank deep (a New York
street, a Western town, a fake suburb), soundstage doors, a water tower, a fake-rain street rig and a fake-flood tank
(the old tour's "special effects" done badly: they work, sort of, and hurt whoever's in them), Revengers merch carts
already selling the leaked-script T-shirts, exit through a gift shop. Enemies: tour guides with megaphones, backlot
security in golf carts, extras in costume. The wires escalated (chains of them, moving rigs). Steve plugs thicken: a
standee every screen, a PA plug. At its end, the doors of DISASTER: THE RIDE. Revisit: once REAL DISASTERS is on, the
lot shows weather (wind, ash, puddles).

### Coaster: coaster (10-19)

THRONES OF THE STARS. The queue: long, switchbacked, full of guests; he skips it (shoving through, over the rails),
hops in the front seat. The rides are shows (he doesn't steer): the camera on the train through loops, corkscrews,
heartlines, the 'suicide coaster' run of ever smaller loops; he whoops, never nauseous (short, specific lines). Three
stops, each a platform up on the structure with a famous person's toilet on a plinth behind velvet ropes, a brass
plaque and spotlights (legally distinct parodies; each more grotesque: the first merely gross, the third a biohazard).
At each stop, employees pile out of a service door to kill the line cutter (new M2 kinds: ride ops, a janitor with a
plunger, a "toilet docent", security; escalating per stop); the train won't go till they're all dead. The third stop:
a sleeping guy in a control booth beside a lever; flip it to EXPERIMENTAL; next ride, the train leaves the track and he
goes through the warehouse's wall (the warehouse section's start; its walls come down). Checkpoint at each stop.
Rides hurt enemies (a guest or employee on the track gets hit). One-way launch: back from the warehouse he's at the
third stop by the booth; give a way down (the train back with the lever off, or service stairs). Revisits differ: the
lever stays flipped, the sleeper gone, the track bent.

### Warehouse: warehouse (20-29), incl. the Ensemble Cast sub-boss

The burst-in (cutscene beat: the train through the wall, all four walls falling outward, the public outside staring
in, phones up). They were secretly filming THE REVENGERS (legally distinct; a sequel number absurd enough) for a tax
write-off; the secret's out; cast and crew are pissed. Its tagline: "REVENGERS: RESEMBLE" (the user's; nonsense on
purpose): on the set's banners, slates, the script's cover, and in the cast's lines where it fits. Green-screen sets: half-built hero sets, mocap-suited stand-ins,
a skyline on a flat, crash mats, rigging (stunt wires), a camera crane (ride it?), wind machines. Enemies: the film
crew (grips with C-stands, boom ops, ADs with headsets, a director with a megaphone, craft services throwing food,
mocap stunt doubles). At the end: the script in a glass case on a pedestal, lit and roped off like a temple idol
(pressure plate, laser grid look). Before he gets near: THE ENSEMBLE CAST (sub-boss): dozens of low-HP principal cast
members, each distinct (costume, build, skin tone, hair, gender; legally distinct A-list parodies with parody names and
one-word bits), arriving in waves (hero landings, entrances, each with a one-liner), till every one is dead. Sub-boss
rules: lock both sides once it starts, never respawned once past (`clear` on its checkpoint), big health + ammo before
it; clean / shitty / naked pools for every line group (the cast react to his state). The user, on the cast:
- **Modestly detailed:** not full stage-boss detail, but each one distinct (costume, build, hair, skin tone, a gender
  mix; legally distinct parody heroes).
- **The bodies stay:** every actor killed falls over dead and STAYS; no body despawns during the fight, so they pile
  up into a huge heap of dead celebrities. Really sell the carnage.
- **No gibs, ever:** whatever the weapon, none of them explodes into bits; every one just falls over dead and
  bloodied, and the body stays on the pile.
- **The joke:** they're so conceited from playing superheroes that they think they ARE superheroes: they fight like
  they have powers they don't (hero poses, catchphrases, fake power moves, wires that aren't hooked up), and die like
  the ordinary people they are.

**The ending (the user's; replaces the old "he kicks the glass case"):** the actors fall dead where they stand
(bloodied, never gibbed, the bodies stay). When the last one dies, Meathead says "BETTER CLEAN UP THE BODIES." Camera
cut: the actors are all in one big pile. He gets in a bulldozer that happens to be in the warehouse and CRASHES it
through the far wall (not a doorway: through the wall), pushing the pile out into a dumpster outside. On the way he
knocks over the protected glass case, and the script's pages go flying everywhere for the onlookers to grab: the leak,
still "the most devastating thing Meathead has done" (cutscene beats, HUD hidden, skip all-or-nothing).
- **The leak is the tragedy, the cast a shrug (the user's):** "they can be replaced by CGI and AI." A studio exec walks
  over the pile and the bulldozer on his phone without a glance, then loses it when the pages fly ("THE SCRIPT WAS THE
  ONLY COPY"); the AD shrugs at the bodies in the fight and panics at the leak; the PA after it (lot, ride, havoc)
  mourns the script, nothing for the stars; the lot's guests gossip spoilers, the deaths a footnote. Meathead cares
  about neither.
- **Where it comes out (geometry.ts):** the dumpster is the lot's first set piece, at the lot's start (the lot owner
  builds and draws it): `LOT_WALL_BREAK` (the warehouse's outside wall face at the lot's left end, x0+90, the jagged
  hole from x0-40 to x0+90, up to GY-230; siding and rebar torn outward, rubble strewn toward the dumpster) and
  `LOT_DUMPSTER` (x0+420 to x0+700, rim at GY-120; overflowing with the dead Revengers, the bulldozer crashed into
  its left end, pages blowing down the lot). The warehouse's cutscene can cut there for the push's last beat.
Revisits differ: walls down for good, sets wrecked, pages everywhere, the case knocked over and empty, the far wall
smashed open (the bulldozer's path out to the dumpster).

**Playtest notes (the user's; they replace the above where they differ):**
- **The burst-in:** he crashes in through the CEILING only (the launch drops him through the roof; a hole in it for
  good). The director panics: a member of the public on the secret set of the newest team-up, REVENGERS:
  END-OF-THE-WORLD'S-DAY (tagline still REVENGERS: RESEMBLE), shot at Happy Land of all places for tax write-off
  purposes, the location kept secret, treated like fucking Area 51; he seriously thinks about bribing or killing
  Meathead. Meathead has no idea what the fuss is and knows next to nothing about the Revengers; the director assumes
  everybody knows it and is hyped. While he's still thinking, the walls all come down and the public sees everything:
  "KILL THEM ALL! THEY CANNOT KNOW!": the crew in the background go fight the civilians who saw (background action), the
  foreground ones come after Meathead. Blunt, short, one speaker at a time.
- **The Ensemble Cast:** one screen, the script in its glass case the showpiece in the background (no collision), no
  platforms. No powers, no unique moves: all just in costume, they DOGPILE him, latching on like cockroaches (hard to
  shove). Each one on him slows him; enough of them and he can't move, and he's dead (piled on: its own hurt and death
  lines). Shooting knocks them loose; a charge throws them off; constant pressure wins. His grab gets one, but the rest
  still pile on. CAPTAIN AMERICANO always first (a short cutscene: "REVENGERS: RESEMBLE!", sure he can stop him because
  he plays a superhero); after him a random order each attempt; generic arrival lines from a shared pool, sparse; not
  every actor or line in any one fight; a cap on how many come at once. More health each than the first pass.
- **The ending:** the camera zooms in on the case as the bulldozer's pile hits it (the case over, the pages flying);
  the studio exec stands at the back by the script on his phone, out of the bulldozer's way. The rest as above.

### Havoc: havoc (50-59)

Every disaster at once, a total juxtaposition: high winds (gusts push him, fling debris and enemies), lava rivers
(across the backlot street), crumbling buildings (facades falling flat, plywood revealing they were only facades),
quakes (the ground buckling), hail, a blizzard with avalanches. Enemies: panicking guests, staff in hazmat/rain gear
trying to manage it, all of them as exposed to the hazards as he is. The flood climb: forced forward momentum, UP (in
-y from GY), the water rising under him as buildings are demolished round him (the climbable stuff collapsing behind).
The TORNADO chasing him: touch it and he dies (voiced death lines); take cover where snow avalanches come down (a lull
in it, or the avalanche sheds it). At the end it catches him and flings him (cutscene) onto the stunt stage. If he died
to the tornado earlier this visit (`diedToTornado()`; call `noteTornadoDeath()` from the kill), he says, mid-fling:
"NORMALLY YOU KILL ME, BUT BECAUSE THIS IS A CUTSCENE I JUST MOVE TO THE NEXT SCRIPTED SET PIECE. OKAY. MAKES PERFECT
SENSE." Hurt + death lines for every new hazard. One-way fling: back from the stage he's where the tornado caught him;
keep it walkable both ways. Revisits differ: the tornado spent, the flood down, the wreckage left, the climb still
climbable.

### Disaster: disaster (40-49) and stunt (60-69)

**Disaster: The Ride** (~6000 px): the queue in (its staff and guests to fight, so it isn't only a cutscene; a
pre-show video of a host who's very excited), then the room: a bench, a big screen, the narrator's loop ("HERE'S AN
EARTHQUAKE." the room shakes lightly; "HERE'S A VOLCANO." marginally warmer (a heat lamp, a red gel); "HERE'S A
TORNADO." fans on; "HERE'S A BLIZZARD." the AC up a bit), looping as he goes. A control booth with another sleeping
cast member and a lever: REAL DISASTERS (EXPERIMENTAL). Flipped: the room's effects go real for a beat (the shake
throws him, the fans tear loose, frost and fire), the wall goes, and out the far side it's havoc. Revisits: the lever
stays on REAL, the room wrecked, the narrator still looping over the real thing.

**Stunt** (the arena, the boss): STUNTMAN STEVE'S STUPENDOUS STUNTERY. The stunt-show set (grandstands half empty, a
ramp, a car on a cable, a fire ring, crash mats, a giant banner of Steve's face, a monitor looping his few frames from a
real film). Steve: a washed-up 80s stunt double, still has his balls, lost his athleticism (sidestepping an oncoming
car is the show). **The fight isn't designed yet: don't design it.** Build the stage, its look, his entrance as a
cutscene beat when the time comes; keep the skeleton's stand-in (VICTORY -> walk-away -> hub, markLandCleared
('hollywood')) till the user gives the fight. A big health + ammo refill before the stage's door. The walk-away is
walkAway/stuntmanSteve.ts (placeholder; his toy: the STUNT_CAR).
