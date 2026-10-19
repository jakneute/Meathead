# Meathead 2's music

Meathead 2 sounds like a late-90s PS1 / high-end N64 game (Final Fantasy VII and IX, Symphony of the Night,
Banjo-Tooie, Conker, Diddy Kong Racing, Crash, Ape Escape), where Meathead 1 sounds like a SNES. Everything is
synthesized at startup: no audio ships, the game stays one offline file.

- `engine.ts`: the player. One song at a time, up to 24 parts, arrangements that crossfade mid-song without losing
  their place (Banjo-Kazooie), intros that loop back (`loopFrom`), velocity, expression, per-note pan, bends, falls,
  portamento, vibrato, slurs, swing; a convolution reverb (generated rooms: `fx.ts`), a tempo-synced ping-pong delay,
  a stereo chorus (per-part sends), the bus compressor and a limiter. Ducked under speech, muffled when paused or
  under water, quieter in a cutscene, off at music volume 0.
- `mml.ts` + **`MML.md`**: the notation (Meathead 1's, extended). Read MML.md before composing.
- `bank/`: the instruments (below). Multi-sampled an octave apart (a note's never sped up or slowed down more than half
  an octave: no chipmunks, formants where they belong), 22-44.1 kHz, stereo where it matters, made lazily in idle
  time (a song's own instruments first, only the zones its notes use), kept for the session.
- `cues.ts`: what plays where (below). `moments.ts`: the VICTORY stamp, the walk-away and the portal walk tell it
  they're on. `../bossQuiet.ts` `markBossFight(state, name)`: every boss fight names itself.
- `songs/`: the songs, by cue id (`songs/index.ts`). **`songs/title.ts` is the showcase**: the quality bar, and the
  worked example to copy.
- The sound test: the pause menu's CHEATS panel, SOUND TEST row (`<` `>` through every song and arrangement, STOP).

## Adding a song

1. Pick its cue id from the registry below and claim it in the table (genre, key, tempo, lead, mood): **no two boss
   themes alike** (different genre, lead instrument, key and tempo from every other boss's).
2. Write it in `songs/<name>.ts` (copy title.ts's shape and helpers). A land's theme has an arrangement per section
   (named by the section id: the table lists them), plus `cutscene` (played, quietly, under the land's cutscenes) and
   `boss` (for any of its fights that hasn't a theme yet), if you like. A boss's song can have an `intro` arrangement
   (played during its opening cutscene). Arrangement names nobody asks for are fine (the sound test plays them).
3. Put it in `songs/index.ts` under its cue id. That's all: `cues.ts` plays it from then on, the sound test lists it.
4. Check the dev console for part-length warnings; listen in the sound test; then `npm run release:m2`.

Until a cue has a song, the next one down its list plays (a sequence or boss falls back to the land's theme, the
TEENAGERS to the Road Rash song); in the end, silence. (The theme, `title`, stood in at the hub, the staff room, the
intro and the walk-away till theirs were written; cues.ts still falls back to it there.)

Keys and tempos the non-boss pieces have taken (land themes and sequences: pick around them where you can): title B-flat
112 shuffle, hub F 168 waltz, intro E-flat 116 march, staff D 84 bossa, walk-away A-flat 84 soul, portal D 128 fanfare,
Jungle Land C minor 100 beguine, its river G 120 calypso, its mine cart F-sharp minor 152 chase, its roof E-flat minor
176, Spooky Land D minor 108 swung shuffle, its clock tower G-sharp minor 160, its ceiling / red mist C octatonic 188,
its Satan C Phrygian 66, Future Land D-flat 132 light swing, its star sled A major 144 (B-flat after the gear change),
its basement stalker F-sharp 80.

## The cue registry

Fill in the columns as you compose (and set Status to done). **Standing requests from the user are in bold.**

### Menus, hub, jingles

| Cue id | When | Arrangements wanted | Genre | Key | Tempo | Lead | Mood | Status |
|---|---|---|---|---|---|---|---|---|
| `title` | Title / menus (no title screen yet); stand-in elsewhere | main, lounge, calliope, cutscene | Big-band theme-park anthem, shuffle | B-flat | 112 | Alto sax | Catchy, slightly sleazy | **done** (showcase) |
| `hub` | The hub (Happy Hub) | main, cutscene | Carousel waltz, 3/4 (tuba oom, accordion pah-pah, woodblock horses); middle in D-flat | F | 168 | Flute, then clarinet, violin (middle), trumpet | Merry-go-round, pleased with itself | **done** ("Round and Round", hub.ts) |
| `staff` | The staff room (the practice pen) | main | Bossa-nova breakroom muzak (80s corporate video) | D | 84 | DX FM piano (flute fills and solo) | Lazy, nobody's working | **done** ("Break Room", staff.ts) |
| `intro` | The way in: parking lot to the gate | garage, security, america, ticket (the intro's zones), back (the walk back after Wilderness Land) | Patriotic Sousa march (strains, trio in A-flat, dogfight), re-orchestrated per zone: PA muzak, nervous checkpoint, full marching band, honky-tonk ragtime, evening harmonica | E-flat | 116 | Trumpet (vibes / clarinet / piano / harmonica by zone) | Flag-waving, never stops | **done** ("America USA", intro.ts) |
| `portal` / `portal:<land>` | The walk into a land's portal | main, plus one per land (adventure, spooky, space, hollywood, foreign, frontier; `portal:<land>` has only its own) | Harp-glissando whoosh into an orchestral fanfare (bVI-bVII-I), once, 16 beats | D | 128 | Trumpet (pan flute / pipe organ / theremin / studio brass / accordion / harmonica by land) | Off we go | **done** ("Heading In", portal.ts) |
| `walkaway` / `walkaway:<boss>` | Walking away from the wreck with the new weapon (bosses: safari-artie, donnie-dracula, space-queen, stuntman-steve, helicopter-harry, tucker) | main, plus one per boss (artie, donnie, queen, steve, harry, tucker; `walkaway:<boss>` has only its own) | 70s soul strut (cool guys don't look at explosions), 16-bar loop | A-flat | 84 | Tenor sax (vibes / pipe organ / saw lead / distorted guitar / sitar / twang guitar by boss) | Smug, earned | **done** ("Walk It Off", walkaway.ts) |
| `jingle:victory` | The VICTORY stamp (plays once: `once: true`) | | Seven rising brass stabs (an eighth = the letters' 11 frames), the big D on the Y, then "shave and a haircut" and a tuba-and-trombone raspberry for "two bits" | D | 164 | Brass + trumpet | Triumphant, then crude | **done** ("VICTORY!", jingles.ts) |
| `jingle:death` | His death (`once: true`) | | Sad-trombone slide down, cut off by the playground taunt, slapstick | G | 140 | Muted trumpet, then xylophone | Mocking | **done** ("Nyah Nyah", jingles.ts) |

There's no game over in Meathead 2 (death goes back to the checkpoint), and no boss-door trigger yet: a boss-door
jingle would need one (moments.ts is where it'd go).

### Lands (a theme each, an arrangement per section, crossfading as he goes)

| Cue id | Land | Sections (arrangement names) | Genre | Key | Tempo | Lead | Mood | Status |
|---|---|---|---|---|---|---|---|---|
| `land:adventure` | JUNGLE LAND | jungle, queue, (river), underwater, dino, temple, (cart), roof, clearing, cutscene, boss | Exotica beguine (Les Baxter) with an adventure-serial march for a B section in E-flat and a "Quiet Village" bridge in D-flat; per section: full jungle band, the queue's muffled speakers (vibes, nylon guitar), celesta under water, horns/pizz/taiko in the dino zoo, oboe snake-charmer backstage at the temple, muted trumpet after the roof, flute and timpani in the clearing | C minor | 100 | Pan flute (vibes / flute / celesta / horn / oboe / harmon trumpet by section); marimba ostinato | Mysterious, then swashbuckling | **done** ("Darkest Jungle Land", jungle.ts) |
| `land:spooky` | SPOOKY LAND | town, castle, dungeon, tower (the loading bay; the climb is `seq:clock-tower`), hell, control, giftshop (the control section past SHOP_X: cues.ts asks for it), ballroom, cutscene, boss | Haunted-house kitsch to gothic dread: a swung spooky shuffle (two-beat tuba, tiptoeing harpsichord, lament bass, the chromatic creep to the raised fourth), a Victorian music-hall B in F, a D Phrygian C with choir and bells; per section: surf-horror guitar and combo organ in the town, harpsichord/pizz/pipe organ and a ticking clock in the castle, a far-off music box in the dungeon, an old hotel-lobby record in the ride's loading bay, the choir singing the hook in hell, Donnie's booth monitors (vibes, tine piano), a calliope for the gift shop chase, a wedding band's violin in the ballroom foyer | D minor | 108 (swing) | Theremin (guitar / harpsichord / music box / harmon trumpet / choir / vibes / calliope / violin / celesta by section) | Kitsch, then dread | **done** ("Grave Expectations", spooky.ts) |
| `land:space` | FUTURE LAND | square, atom, (ride), drag, needle, (orbit), crater, xenoscare (the crater past HOUSE_DOOR: cues.ts asks for it), queen (the hold), stalker (fallback), disco (past the basement's stairs: cues.ts asks for it), cutscene, boss | Space-age bachelor pad (Esquivel, Raymond Scott), ping-pong stereo off a plate: vibes and an "ooh" chorus on the hook, zu-zu voices right vs brass pows left, Charleston piano, upright bounce, bongos; a B up a major third in E; a 60s TV-space bridge in B-flat minor (line cliche, wordless soprano, xylophone machine). Per section: the full orchestra on the square, the ride's 1990 DX re-record through the flats in the atom, open trumpet on the drag, elevator muzak at the needle, theremin B-movie at the crater, celesta/drone/heartbeat in XENOSCARE, lone vibes and low choir in the hold, the theme as a disco record at the space disco | D-flat | 132 (light swing) | Vibraphone + oohs (DX piano / trumpet / theremin / celesta by section; soprano on the bridge) | Gleaming 1962 optimism, rotting into horror | **done** ("The Future Is Still Loading", space.ts) |
| `land:hollywood` | HOLLYWOOD LAND | blvd, (coaster), warehouse, lot, (disaster), (havoc), stunt | | | | | | |
| `land:foreign` | FOREIGN LANDS | mexico, norway, china, germany, italy, japan, morocco, france, uk, canada (each pavilion its country's style: the Banjo moment), (heli), harry | | | | | | |
| `land:frontier` | WILDERNESS LAND | wilds, (train), town, (logride), woods, (dirtbike), arena | | | | | | |

(Sections in brackets have a sequence's or a boss's music of their own; the land's arrangement for them is only the
fallback.) Under water (Jungle Land's river) everything's muffled by the engine already. A set piece's song can have
arrangements by what's on in it (cues.ts `seqArrs`: Jungle Land's boat/underwater, the cart's ride/chase, the roof's
artie/run, the clock tower's climb/down, the gift shop's giftshop, the star sled's act1/lift/space/warehouse, Future
Land's xenoscare and disco), and end while he's still in its section or not
start till he's further in (`seqOver`: the roof, once he's tumbled off it; the clock tower's loading bay). Moments
inside a section can have their own cue too (cues.ts `spookyMoment`: the dungeon's chamber, Satan's finale).

### Special sequences

| Cue id | Where | Genre | Key | Tempo | Lead | Mood | Status |
|---|---|---|---|---|---|---|---|
| `seq:river` | Jungle Land: the river (arrangements: boat, underwater: cues.ts picks by his swimming) | The Jungle Cruise's canned tiki calypso under Artie's set, a ba-dum-tss every eight bars; under the water the same tune dreamy (celesta, warm pad, harp, oohs) | G | 120 | Steel drum (celesta under water) | Sunny, dumb | **done** ("Backside of Water", jungle.ts) |
| `seq:mine-cart` | Jungle Land: the mine-cart ride (arrangements: ride; chase while Artie's on his tail) | Saturday-serial mine-cart chase: galloping strings, train beat, xylophone; the chase adds the brass section, taiko, choir and trombones quoting Artie's theme | F-sharp minor (Neapolitan G in C) | 152 | Trumpet | Breakneck | **done** ("Unfriendly Guests", jungle.ts) |
| `seq:temple-collapse` | Jungle Land: the roof, from the blowout till he's tumbled off it (arrangements: artie while Artie has his say, run) | Orchestral escape: violins running, brass stabs in threes, choir, taiko, orchestra hits | E-flat minor | 176 | Strings (violins) | Panic | **done** ("Bring the House Down", jungle.ts) |
| `seq:clock-tower` | Spooky Land: the clock tower itself (not its loading bay: seqOver), arrangements climb, down (after the crash: cues.ts picks), cutscene (the crash) | Castlevania Bloodlines / Super Metroid tower: harpsichord sixteenths like gears, solo violin, rock organ, octave bass, woodblock ticks, the bell; a B section in B major, the Neapolitan A against G#m in half time; power chords on the way down | G-sharp minor | 160 | Violin | Climbing, swaying | **done** ("Load-Bearing", spooky.ts) |
| `seq:ceiling` / `seq:red-mist` | Spooky Land: the dungeon's chamber of the descending ceiling (ceiling: the doors slammed, the wait; chase: the ceiling coming down); the red mist's hallway (not built yet: `seq:red-mist` is the same song, wire it up with 'chase' when it is) | Silent Hill industrial chase: palm-muted tritone ostinato, metal clank, heartbeat, minor-second string clusters swelling, tremolo violins, choir and brass stabs, the horns' motif climbing a minor third every 8 bars | C octatonic | 188 | Horns + trombone (motif) | Dread, run | **done** ("Red Mist", spooky.ts) |
| `seq:satan` | Spooky Land: after the demon, his "daaaad", Satan up out of the lava, the geyser (arrangements whine, satan, launch: cues.ts picks by the finale's step; the whole scene only, not the vent's later rides) | A sad harmon trumpet whining over the organ's pedal, then C Phrygian dread: choir chant, horns, timpani heartbeat, gong, tremolo strings; the geyser adds taiko and orchestra hits | C Phrygian | 66 | Harmon trumpet, then horns + choir | Pathetic, then infernal | **done** ("Daddy's Home", spooky.ts) |
| `seq:space-train` | Future Land: the hijacked star sled on the Voyage to 2010 (arrangements by the sled: act1 the dark ride, lift the chain lift, space act 2, warehouse once the work lights are on, cutscene the brake run / drop / station / launch) | The ride's own 1990 corporate-optimism synth pop: DX bell piano, synth brass stabs, PWM pad, marimba sequencer, slap bass, gated snare and claps, glock and "aah" choir on the chorus (bVI-bVII-I), the truck driver's gear change up a half step | A major (then B-flat) | 144 | DX FM piano | Cheesy, relentlessly upbeat | **done** ("Voyage to 2010", space.ts) |
| `seq:stalker` | Future Land: the basement, the queen stalking him in the dark (arrangements by her: dark while she's away, near while she's out, hunt once she's on him and up the stairs) | **Atmospheric, scary and creepy (the user's): no beat, drones, the dark**: a contrabass drone breathing in and out, a warm pad, breathing "ooh"s, a minor-second string cluster swelling, timpani rumbles into far taiko hits, a gong, echoing harp drips; out: her clicks (castanets, claves), a heartbeat, her horn motif (F#-G-C); on him: the groove at last (16th synth-bass ostinato, kit, taiko, tremolo strings, tritone brass stabs) | F-sharp (Locrian-ish) | 80 | Drones (horn motif) | Dread, then panic | **done** ("Something in the Vents", space.ts) |
| `seq:coaster` | Hollywood Land: Thrones of the Stars, the toilet coaster | | | | | | |
| `seq:disaster-ride` | Hollywood Land: Disaster: The Ride | | | | | | |
| `seq:havoc` | Hollywood Land: the all-disasters run | | | | | | |
| `seq:heli` | Foreign Lands: boarding and jacking the helicopter (the gauntlet itself is `boss:heli-gauntlet`) | | | | | | |
| `seq:train` | Wilderness Land: the train | | | | | | |
| `seq:log-ride` | Wilderness Land: the log ride | | | | | | |
| `seq:road-rash` | Wilderness Land: the dirt-bike chase (the TEENAGERS sub-boss: one song for both) | | | | | | |

### Bosses and sub-bosses: a unique theme each, NO TWO ALIKE

The columns are filled with a suggested plan that keeps every one distinct (genre, key, tempo and lead all
different from every other's). Change any of it, but keep them all different.

| Cue id | Who | Land | Genre | Key | Tempo | Lead | Mood | Status |
|---|---|---|---|---|---|---|---|---|
| `boss:trex` | The T. rex (sub-boss) | Jungle | Orchestral stomp: tuba/cello grinding a C#-D ostinato, taiko and bass drum footsteps, choir shouts; its speaker's music-box ditty in E major winding down, slammed in C# minor by the brass (arrangements: main, intro) | C-sharp minor | 96 | Horns + taiko | Primal, huge, broken | **done** ("Animatronic Apex", jungleBosses.ts) |
| `boss:safari-artie` | Safari Artie | Jungle | Perez Prado exotica mambo (sax riff, brass shouts, montuno, timbales, "UGH!") breaking into a swung comedy-club combo (Hammond, walking bass, harmon trumpet, rimshots); opens with a club-intro vamp in B-flat major (arrangements: main, intro) | B-flat minor | 168 | Trumpet | Brash, sweaty, heckled | **done** ("Tough Crowd", jungleBosses.ts) |
| `boss:demon` | The hell demon, BLOATHAZAR (sub-boss) | Spooky | Thrash metal that runs out of breath: a galloping riff (flat two, flat five, a chromatic slide off the couch), twin leads in thirds, skank beat; a half-time doom slump where a tuba takes the tune (and farts down an octave); a shred solo; a double-kick breakdown with gang "HEY!"s; opens with a yawn (arrangements: main, intro) | E minor | 200 | Distorted lead (+ chugs, tuba) | Lazy, then furious | **done** ("Hell's Couch Potato", spookyBosses.ts) |
| `boss:donnie-dracula` | Donnie Dracula | Spooky | Tacky grandeur: a toccata flourish, a real three-voice organ fugue (subject, tonal answer, countersubject, pedal entry), an 80s rock opera on the subject, a ballroom tango in C minor (accordion, castanets, pizz, violin, habanera), the subject in augmentation on brass and organ with a disco-ball glockenspiel (arrangements: main, intro) | G minor | 138 | Pipe organ + harpsichord (accordion in the tango) | Camp gothic | **done** ("Fangs for Coming", spookyBosses.ts) |
| `boss:ufo` | The flying saucer (sub-boss, the whole orbit shooter) | Future | 1962 space-race rock instrumental (Joe Meek's Telstar, the Ventures) as a shmup: twang guitar riffing in spring reverb, combo organ offbeats, surf kit, tape echo, theremin swoops at phrase ends; a Telstar lift to C, a half-time Neapolitan menace (low horns, choir), a Misirlou surf break (tremolo picking, galloping toms) (arrangements by the saucer, cues.ts ufoArr: main, beam (pissed / THE BEAM: the brass doubles the tune), down (it's got him, it blows, the fall), drift (back up after it's gone)) | A minor | 176 | Square lead (clavioline) + theremin | Retro panic | **done** ("Mourning Star", spaceBosses.ts) |
| `boss:space-queen` | The queen (the space disco) | Future | Italo disco: supersaw hook, 16th octave synth bass, 909 four on the floor with open hats and claps, Simmons toms, string stabs, PWM pad, DX bell arps, choir "vocoder", orchestra hits; a breakdown with the impregnator ray sweeping up on a saw lead (arrangements: main, intro) | F minor | 124 | Supersaw + strings | Glittery menace | **done** ("Less Fatal Mode", spaceBosses.ts) |
| `boss:ensemble-cast` | The Ensemble Cast (sub-boss) | Hollywood | Superhero-movie march | E-flat major | 132 | Brass section | Bombastic, self-important | |
| `boss:stuntman-steve` | Stuntman Steve | Hollywood | 70s car-chase funk | C Dorian | 116 | Clavinet + slap bass | Cocky | |
| `boss:heli-gauntlet` | The helicopter gauntlet (sub-boss) | Foreign | 80s action-movie synth rock | D minor | 150 | Synth brass + power chords | Adrenaline | |
| `boss:helicopter-harry` | Helicopter Harry | Foreign | Psychedelic sitar rock, turning military (tie-dye to Rambo: arrangements) | E Mixolydian | 108 | Sitar + organ | Trippy, then martial | |
| `boss:teenagers` | The TEENAGERS (sub-boss) | Wilderness | = `seq:road-rash`: early-90s Genesis punk/grunge | G major | 186 | Overdriven guitar | Snotty speed | |
| `boss:tucker` | Tucker | Wilderness | Spaghetti-western showdown | B minor | 92 | Harmonica (whistle, twang) | Standoff | |

New fights: name them (`markBossFight(state, 'name')`) and add a row; a fight that doesn't name itself is found by
its land and section (`SECTION_BOSS` in cues.ts).

## The instruments

Names as a part's `inst` (or MML's `@name`) wants them. Zones: the MIDI roots each is sampled at (an octave apart:
each covers 6 below to 5 above).

**Keys:** `piano` (grand: 2-3 strings a note, stiff overtones, hammer, soundboard; stereo, 24-108), `epiano` (tine
Rhodes, barks when hit hard; 36-96), `fmpiano` (80s DX bell-piano), `organ` (drawbars, Leslie fast, click,
percussion), `organslow` (gospel drawbars, Leslie slow), `churchorgan` (pipes, chiff; 24-96), `calliope` (steam
calliope / band organ; 48-96), `harpsichord`, `clav`, `accordion` (musette; 48-84), `harmonica` (60-96).

**Mallets, tuned percussion:** `celesta` (60-108), `musicbox` (60-108), `marimba` (36-96), `vibes` (motor on;
48-96), `glock` (72-108), `xylophone` (60-108), `chimes` (tubular bells; 60-84), `steeldrum` (48-96), `timpani`
(pitched; 36-60), `orchhit` (a major chord on the note; 48-72).

**Strings:** `strings` (section: eight players, bows biting in; 36-96), `slowstrings` (the same, slow swell),
`violin` (solo; 60-96), `cello` (solo, and contrabass down low; 36-72), `pizz` (section pizzicato), `harp`.

**Brass:** `brass` (section of four: blat, scoop, ragged entries; 36-84), `trumpet` (48-96), `mutetrumpet` (harmon
mute; 48-96), `horn` (French horn pair; 36-84), `trombone` (36-72), `tuba` (24-60), `synthbrass` (analog).

**Woodwinds:** `flute` (60-96), `panflute`, `clarinet` (48-84), `oboe` (60-96), `sax` (alto; 48-84), `tenorsax`
(36-72).

**Voices:** `choir` ("aah", mixed: male formants low, female high; 36-84), `oohs`.

**Synths:** `supersaw`, `pwm` (pad), `warmpad`, `squarelead` (48-96), `sawlead` (48-96), `theremin` (48-96: give it
`_g` glides).

**Basses** (24-60): `bass` (finger), `slapbass`, `upright`, `synthbass` (resonant, swept), `bass808` (24-48).

**Guitars:** `cleangtr`, `steelgtr`, `nylongtr`, `overdrive`, `distlead` (sustains, sings) (all 40-88), `powerchord`,
`chug` (palm-muted) (play the root; 28-64), `banjo` (48-84).

**World:** `sitar` (buzzing bridge), `koto`, `shamisen`, `steeldrum`, `panflute`, `accordion`.

**Drums** (played as they are; a drum part's letters or `(name)`: MML.md has the kits):
kit: `kick`, `kicksoft`, `snare`, `snare2`, `rimshot`, `sidestick`, `brushsnare`, `tom1` `tom2` `tom3` `tom4`, `hat`,
`ohat`, `hatpedal`, `crash`, `splash`, `china`, `ride`, `ridebell`, `clap`;
808: `808kick`, `808snare`, `808clap`, `808hat`, `808ohat`, `808cowbell`, `808tom`, `808tomlo`, `808rim`, `clave`;
909: `909kick`, `909snare`, `909clap`, `909hat`, `909ohat`;
orchestra / world: `taiko`, `bassdrum`, `gong`, `congahi`, `congalo`, `congaslap`, `bongohi`, `bongolo`, `timbale`,
`cowbell`, `tamb`, `shaker`, `castanets`, `woodblock`, `woodblocklo`, `triangle`, `trimute`, `sleigh`, `slapstick`,
`scratch`.

New instruments go in `bank/melodic.ts` or `bank/drums.ts`, built from `bank/kit.ts`'s kinds (held, pluck, modal,
custom) and `bank/dsp.ts`'s parts. Held sounds must loop exactly: after their attack, only whole-hertz frequencies
and whole-hertz modulations (kit.ts explains).

## Budget

The minimum spec is a 2010 $300 PC. The samples are made only for the zones songs actually use, a land's songs as
he arrives, in idle time; at runtime it's buffer playback plus one convolver, two delays and a chorus per song. Keep
songs to 24 parts or fewer, don't hold dozens of long one-shot notes at once (`poly` caps a part), and prefer
fewer, better parts.
