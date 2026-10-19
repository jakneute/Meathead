# Meathead 2's MML

The music is written in MML (Music Macro Language, the way old game music often was), one string per part. The
dialect is Meathead 1's (every M1 line means the same here) plus extensions for velocity, swells, pan, bends,
portamento, vibrato, slurs, swing and effect sends. The parser is `mml.ts`; the player is `engine.ts`; the instruments
are in `bank/` (MUSIC.md lists them all). `songs/title.ts` is a complete worked example: read it first.

Case doesn't matter. Whitespace and `|` (bar lines) are ignored: they're for reading. **Write every part a bar at a
time with its octave at the start of the bar** (`o4 ... | o5 ...`), so one wrong `>` can't drift the rest of the song.

## Notes, rests, lengths

| Write | Means |
|---|---|
| `c d e f g a b` | Notes. `+` or `#` sharpens, `-` flattens: `f+`, `b-`, `c#`. |
| `c4` `c8` `c16` | A length: 1 whole, 2 half, 4 quarter, 8 eighth, 16, 32. Triplets: `12` (eighth triplet), `6` (quarter triplet), `24`. |
| `c4.` `c4..` | Dotted, double dotted. |
| `c4^8` `c1^1` | Ties: lengths added together. |
| `r` `r4` | A rest (same lengths). |
| `l8` | Notes without a length are eighths from here on. |
| `o4` | Octave 4 (`o4 c` is middle C, MIDI 60). |
| `>` `<` | Up / down an octave. |
| `{ceg}4` | A chord: the notes at once (`>` and `<` work inside: `{e- g b- >d}`). |
| `[ ... ]3` | Play what's inside three times (2 if no number). They nest. |

## Loudness and articulation

| Write | Means |
|---|---|
| `v12` | Velocity 0..15 (M1's). Default 12. |
| `_v100` | Velocity 1..127 (finer). Velocity is loudness, and on instruments with `velBright` (piano, epiano, brass, saxes, basses, guitars...) a soft note is darker too. |
| `!c8` | Accent: this one note 35% harder. |
| `?c8` | Ghost note: this one note at 45%. |
| `q6` | Hold each note 6/8 of its length (M1's; default 7). `q3` is staccato, `q8` legato. |
| `_q90` | The same in percent (1..100). |
| `c4~ d4` | Slur: `c` is held into `d`, and `d` doesn't re-attack (bowed, blown, sung legato). With `_g` it glides too. |
| `_e80` | Expression (0..127): the part's volume from here (a swell, a fade) without changing velocities. Default 127. |
| `_e127/1` | Expression ramped to 127 over a whole note (any length after the `/`: `/2`, `/4.`, `/1^1` for two bars). Put a `_e` straight before it to say where the ramp starts: `_e30 _e127/1^1`. |

## Pitch

| Write | Means |
|---|---|
| `_b-2 c4` | Bend into the next note (or chord) from 2 semitones below (a scoop). `_b-1/16`: over a sixteenth (default a sixteenth note's worth: `/16`). Decimals work: `_b-0.5`. |
| `_f-5 c2` | A fall: the next note drops 5 semitones off its end (brass falls, sax drops). `_f-5/4`: over its last quarter (default an eighth). |
| `_g16` | Portamento: from here every note glides from the last one, over a sixteenth (any length). `_g0` stops it. |
| `_m20` | Vibrato depth in cents for the notes from here (it fades in after the instrument's delay). `_m0` is none; leave it out for the instrument's own. |
| `_k-12` | Transpose the notes from here (semitones). `_k0` back. |

## Placement and effects

| Write | Means |
|---|---|
| `_p-40 c4` | Pan the notes from here: -100 (left) .. 100 (right), on top of the part's own `pan`. `_p0` back to the part's. |
| `_r60` | The part's reverb send from here (0..127). `_r60/2` ramps it. |
| `_d40` | Its delay send (the song's tempo-synced ping-pong). |
| `_c40` | Its chorus send. |
| `@strings` | The notes from here on another instrument (the bank's name). `@` alone goes back to the part's own. (In a drum part use `(name)` for a drum instead.) |

## Swing

| Write | Means |
|---|---|
| `_w50` | Swing from here: 0 straight, 100 a full triplet shuffle (the off-beat pushed to the third triplet). |
| `_w60,16` | Swing on sixteenths instead of eighths. |

A whole song can swing (`swing: 0.45, grid: 8` in the Song), or a part (`swing`, `grid` on the Part); `_w` changes it
mid-part. Everything's swung: notes, rests, lengths, control changes.

## Drum parts

A part with `drums: true` reads letters as drums instead of notes (and `{kh}8` hits two at once):

| Letter | Acoustic kit | 808 kit | 909 kit | brush kit | orchestra kit |
|---|---|---|---|---|---|
| `k` | kick | 808kick | 909kick | kicksoft | bassdrum |
| `s` | snare | 808snare | 909snare | brushsnare | snare2 |
| `h` | hat (closed) | 808hat | 909hat | hatpedal | |
| `o` | ohat (open) | 808ohat | 909ohat | | |
| `p` | clap | 808clap | 909clap | | |
| `x` | crash | | | | crash |
| `i` | ride | | | | triangle |
| `t` `u` | tom1, tom3 | 808tom, 808tomlo | | | |
| `m` | sidestick | 808rim | | sidestick | |
| `w` | cowbell | 808cowbell | | | cowbell |
| `e` | woodblock | clave | | | woodblock |
| `c` `d` | congahi, congalo | | | | |
| `b` | bongohi | | | | |
| `z` `j` `y` | shaker, tamb, sleigh | | | | |
| `f` | taiko | | | | |
| `n` | brushsnare | | | | |
| `a` | slapstick | | | | |
| `g` | scratch | | | | gong |

Choose the kit with the part's `kit` ('acoustic' is the default; a kit's blank letters are the acoustic kit's).
**Any drum by name:** `(ride)8`, `(tom2)16`, `{k(crash)}4`. All of them are in MUSIC.md.

The open hats are choked by the closed and pedal hats (they share a choke group). `v`, `_v`, `!`, `?`, `_p`, `_e`
and the sends all work in drum parts. `o`, `t`, `s`... are drums there, so set octaves only in melodic parts.

## A Song

```ts
import type { Song } from '../engine';
export const MY_SONG: Song = {
  title: 'Tucker\'s Showdown',     // for the sound test
  bpm: 92,
  swing: 0, grid: 8,              // optional
  loopFrom: 16,                   // beats: an intro plays once, then it loops from here (0 if not given)
  reverb: 'hall',                 // room | hall | cathedral | cave | plate | spring
  reverbMix: 1,
  delay: { beats: 0.75, feedback: 0.3, tone: 3000 },   // the delay's time (a dotted eighth), repeats, darkness
  parts: {
    lead: { inst: 'harmonica', mml: '...', pan: 0, rev: 0.25, dly: 0.15 },
    drums: { inst: 'kick', drums: true, kit: 'acoustic', mml: '...' },
    pad: { inst: 'strings', mml: '...', only: ['town'] },      // only in some arrangements
    gtr: { inst: 'cleangtr', mml: '...', not: ['cutscene'] }, // or in all but some
  },
  arrangements: {
    main: {},
    town: { inst: { lead: 'flute' }, mute: ['drums'], vol: { pad: 0.6 }, rev: { lead: 0.4 } },
    mine: { lowpass: 900, level: 0.8 },        // the whole song muffled, quieter (heard from inside a mine)
    cutscene: { solo: ['lead', 'pad'] },       // only these parts
  },
};
```

**Part:** `inst`, `mml`, `drums`, `kit`, `vol` (multiplier), `pan` (-1..1), `rev` `dly` `cho` (sends 0..1; default
0.22 reverb, no delay, no chorus), `only` / `not` (arrangements), `swing` / `grid`, `vib` ([rate Hz, cents, delay s]
in place of the instrument's), `poly` (most notes ringing at once), `tr` (transpose, semitones).

**Arrangement:** `inst` (parts on another instrument), `mute`, `solo`, `vol`, `rev`, `lowpass` (Hz: the whole song),
`level` (the whole song). Switching arrangement crossfades each part (about a second and a half) without losing the
song's place.

**Every part must be the song's length** (or a whole fraction of it: a one-bar drum loop under a 32-bar song is fine:
it repeats). A part that isn't is warned about in the dev console. Bars of only a command (`['_v90']`, `['q4']`) take
no time.

## Tips

- Think in sections of 4 / 8 bars, and write each part as a list of bars joined with ` | ` (title.ts's `join`).
- Use TypeScript for the repetition: chord tables, bass patterns from roots, `up()` for an octave (title.ts).
- Keep to an instrument's range: each is sampled over the octaves listed in MUSIC.md; a note far outside its zones
  plays from the nearest one sped up or slowed down (it'll chipmunk).
- Velocity is the cheapest expression there is: vary it. Accents (`!`) on syncopations, ghosts (`?`) on hats.
- Held instruments (strings, brass, choir, organ, pads) sustain as long as the note does; one-shots (piano, plucks,
  mallets, drums) ring out on their own and are let go at the note's end (its `q`).
- Bend saxes and brass into notes (`_b-1`), fall off phrase ends (`_f-4`); slur legato lines (`~`).
- Up to 24 parts. Fewer, well-written parts sound bigger than many muddy ones.
