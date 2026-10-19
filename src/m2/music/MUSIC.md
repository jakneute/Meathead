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
112 shuffle, hub F 168 waltz, intro E-flat 116 march, staff D 84 bossa, walk-away A-flat 84 soul, portal D 128 fanfare.

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
| `land:adventure` | JUNGLE LAND | jungle, queue, (river), dino, temple, (cart), roof, clearing | | | | | | |
| `land:spooky` | SPOOKY LAND | town, castle, dungeon, tower, hell, control, ballroom | | | | | | |
| `land:space` | FUTURE LAND | square, atom, (ride), drag, needle, (orbit), crater, queen | | | | | | |
| `land:hollywood` | HOLLYWOOD LAND | blvd, (coaster), warehouse, lot, (disaster), (havoc), stunt | | | | | | |
| `land:foreign` | FOREIGN LANDS | mexico, norway, china, germany, italy, japan, morocco, france, uk, canada (each pavilion its country's style: the Banjo moment), (heli), harry | | | | | | |
| `land:frontier` | WILDERNESS LAND | wilds, (train), town, (logride), woods, (dirtbike), arena | | | | | | |

(Sections in brackets have a sequence's or a boss's music of their own; the land's arrangement for them is only the
fallback.) Under water (Jungle Land's river) everything's muffled by the engine already.

### Special sequences

| Cue id | Where | Genre | Key | Tempo | Lead | Mood | Status |
|---|---|---|---|---|---|---|---|
| `seq:river` | Jungle Land: the river (the boat; under water muffled) | | | | | | |
| `seq:mine-cart` | Jungle Land: the mine-cart ride | | | | | | |
| `seq:space-train` | Future Land: the hijacked train | | | | | | |
| `seq:stalker` | Future Land: the basement, the queen stalking him in the dark | **Atmospheric, scary and creepy (the user's): no beat, drones, the dark** | | | | | |
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
| `boss:trex` | The T. rex (sub-boss) | Jungle | Orchestral stomp: low brass ostinato, taiko, choir shouts | C-sharp minor | 96 | Horns + taiko | Primal, huge | |
| `boss:safari-artie` | Safari Artie | Jungle | Exotica big-band mambo: bongos, congas, brass shouts | B-flat minor | 168 | Trumpet | Brash, sweaty | |
| `boss:demon` | The hell demon (sub-boss) | Spooky | Thrash metal | E minor | 200 | Distorted lead + chugs | Furious | |
| `boss:donnie-dracula` | Donnie Dracula | Spooky | Baroque gothic fugue (Symphony of the Night) | G minor | 138 | Pipe organ + harpsichord | Camp gothic | |
| `boss:ufo` | The flying saucer (sub-boss, the whole orbit shooter) | Future | 60s sci-fi surf rock | A minor | 176 | Theremin | Retro panic | |
| `boss:space-queen` | The queen (the space disco) | Future | Italo disco: 909, string stabs, slap bass | F minor | 124 | Supersaw + strings | Glittery menace | |
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
