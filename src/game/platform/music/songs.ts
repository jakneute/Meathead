// Every tune in the game. Each stage has one theme with an arrangement for each part of the stage (the tune carries
// on through, the instruments change around it: Banjo-Kazooie style); the bosses share one theme, arranged for each
// of them; and the menus, the cutscenes and the jingles have their own. Written in MML (see mml.ts). Every part's
// written a bar at a time with its octave at the start of the bar, so a bar can't drift.

import type { Song } from './engine';

/** Bars joined up. */
const b = (...bars: string[]) => bars.join(' | ');
/** A bar (or a few) repeated. */
const rep = (s: string, n: number) => `[${s}]${n}`;
/** One chord per bar, held (a pad). `chords` like 'ace', 'dfa' (all in octave o). */
const pad = (o: number, chords: string[], len = '1') => chords.map(c => `o${o} {${c}}${len}`).join(' | ');
/** Offbeat stabs, four a bar. */
const stabs = (o: number, chords: string[]) => chords.map(c => `o${o} r8 {${c}}8 r8 {${c}}8 r8 {${c}}8 r8 {${c}}8`).join(' | ');
/** Two stabs a bar, on the "and" of one and three (a skank). */
const skank = (o: number, chords: string[]) => chords.map(c => `o${o} r8 {${c}}8 r4 r8 {${c}}8 r4`).join(' | ');
/** Up-and-down eighth-note arpeggios: [low octave notes, high octave note] per bar, e.g. ['ace', 'a']. */
/** The notes in a chord string ('eg+b' is e, g+, b). */
const notes = (c: string) => c.match(/[a-g][+#-]?/g) ?? [];
const arp = (o: number, bars: [string, string][]) => bars.map(([c, top]) => {
  const n = notes(c);
  return `o${o} ${n[0]} ${n[1]} ${n[2]} o${o + 1} ${top} o${o} ${n[2]} ${n[1]} ${n[0]} ${n[1]}`;
}).join(' | ');
/** A bass line: `pattern` with R the root (and F its fifth, O the root an octave up), one root per bar. */
const bass = (o: number, pattern: string, roots: string[]) => roots.map(r => {
  const [root, fifth] = r.split('/');
  return `o${o} ` + pattern.replace(/O/g, `>${root}<`).replace(/F/g, fifth ?? root).replace(/R/g, root);
}).join(' | ');

// A few drum grooves (a bar each)
const ROCK = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const ROCK_FILL = '{kh}8 h8 {sh}8 h8 s16 s16 t16 t16 u16 u16 {kx}8';
const DRIVE = '{kh}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {sh}8';
const FOUR = '{kh}8 o8 {kph}8 o8 {kh}8 o8 {kph}8 o8';
const FUNK = '{kh}16 h16 h16 k16 {sh}16 h16 h16 k16 h16 k16 h16 h16 {sh}16 h16 {kh}16 h16';
const BOOM = 'k8 h8 {sh}8 h8 r16 k16 k8 {sh}8 h8';
const LIGHT = 'k8 z8 m8 z8 k8 k8 m8 z8';
const TRAIN = '{kh}16 h16 s16 h16 {kh}16 h16 s16 {sh}16 {kh}16 h16 s16 h16 {kh}16 h16 {sh}16 s16';

export const SONGS: Record<string, Song> = {
  // ---------------------------------------------------------------------------------------------------------------
  // The title: a big, dumb, heroic rock anthem. Power chords, a brass tune, a lot of drums.
  title: {
    bpm: 150,
    parts: {
      riff: { inst: 'power', vol: 0.9, pan: -0.3, mml: rep('o2 l8 e e r e g4 a4 | o2 l8 e e r e c4 d4', 4) },
      bass: { inst: 'bass', mml: rep('o2 l8 e e e e g g a a | o2 l8 e e e e c c d d', 4) },
      lead: { inst: 'brass', pan: 0.15, mml: b('o5 l8 e4. g b4 a g', 'o5 a4 g e d2', 'o5 e4. g b4 > d < b', 'o5 a2^4 r4', 'o6 e4. d < b4 a g', 'o5 a4 b g e2', 'o5 d4. e g4 a b', 'o5 e1') },
      harm: { inst: 'strings', vol: 0.6, pan: 0.35, mml: rep(`${pad(4, ['egb'])} | o4 {ceg}2 {df+a}2`, 4) },
      drums: { inst: 'kick', drums: true, mml: b(`{kx}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8`, ROCK, ROCK, ROCK, ROCK, ROCK, ROCK, ROCK_FILL) },
      choir: { inst: 'choir', vol: 0.8, only: ['ending'], mml: b('o5 l8 e4. g b4 a g', 'o5 a4 g e d2', 'o5 e4. g b4 > d < b', 'o5 a2^4 r4', 'o6 e4. d < b4 a g', 'o5 a4 b g e2', 'o5 d4. e g4 a b', 'o5 e1') },
    },
    arrangements: {
      main: {},
      ending: { inst: { lead: 'trumpet', harm: 'slowstrings' }, vol: { riff: 0.7 } },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // The gym (the opening stage): an 80s workout montage. A pumping synth bass, gated drums, a brass hook to punch the
  // air to, a guitar chugging under it.
  gym: {
    bpm: 128,
    parts: {
      bass: { inst: 'bass', mml: rep('o2 l8 e e > e < e e e > e < e | o2 l8 c c > c < c d d > d < d', 4) },
      chug: { inst: 'power', vol: 0.7, pan: -0.3, mml: rep('o3 l16 e e e e r8 e e e e r8 e8 g8 | o3 l16 c c c c r8 c c d d r8 d8 f+8', 4) },
      lead: { inst: 'brass', pan: 0.2, mml: b('o5 l8 b4 b a g4 e4', 'o5 g4 a b > d4 < b4', 'o5 b4 b a g4 a4', 'o5 b2. r4', 'o6 e4 d < b > d4 e4', 'o6 d4 < b a g4 a4', 'o5 b4 > d < b a4 g4', 'o5 e1') },
      pad: { inst: 'strings', vol: 0.5, pan: 0.35, mml: rep(`${pad(4, ['egb'])} | o4 {ceg}2 {df+a}2`, 4) },
      drums: { inst: 'kick', drums: true, mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // The map (the stage select): a cool, sneaky, funky briefing groove. Darker for the second four.
  map: {
    bpm: 104,
    parts: {
      bass: { inst: 'slap', mml: rep('o2 l8 d r d f g r a > c < | o2 l8 d r d f a g f e', 4) },
      keys: { inst: 'epiano', vol: 0.8, pan: -0.3, mml: stabs(4, ['dfac', 'egb-d', 'dfac', 'c+eg', 'dfac', 'egb-d', 'fac', 'c+ega']) },
      lead: { inst: 'sax', pan: 0.2, mml: b('o5 l8 d4 f g a4 r4', 'o5 c a4 g f g4 r8', 'o5 d4 f g a4 > c d', 'o6 d4. c o5 a2', 'o5 f4 g a > c4 < a4', 'o5 g f d f g2', 'o5 a4 > c d f4 e d', 'o6 d2 r2') },
      drums: { inst: 'kick', drums: true, mml: rep('k8 h8 {sh}8 h8 k8 k8 {sh}8 {hz}8', 8) },
      pad: { inst: 'pad', vol: 0.6, only: ['set2'], mml: pad(3, ['dfa', 'dfa', 'dfa', 'c+ea', 'dfa', 'dfa', 'fac', 'c+ea']) },
    },
    arrangements: {
      main: {},
      set2: { inst: { keys: 'organ', lead: 'trumpet' }, vol: { keys: 0.7 } },
    },
  },

  // A fanfare as the map swoops down on the target (the deploy; three and a half seconds or so)
  fanfare: {
    bpm: 132, once: true,
    parts: {
      lead: { inst: 'trumpet', mml: 'o4 l8 g g g > c4. < g > c e g2 r8' },
      harm: { inst: 'brass', vol: 0.8, mml: 'o4 l8 e e e g4. e g c e2 r8' },
      low: { inst: 'brass', vol: 0.8, mml: 'o3 l8 c c c e4. c e g > c2 < r8' },
      hit: { inst: 'hit', mml: 'o4 c4 r4 r4 r8 r4 c4 r4' },
      timp: { inst: 'timpani', mml: 'o2 l16 g g g g g g g g g g g g g g g g g g g g g g g g g4 r4' },
      cym: { inst: 'kick', drums: true, mml: '{kx}4 r4 r4 r8 r4 {kx}4 r4' },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // Artie: icy and a bit grand. Bells up the trail, flute on the tram, brass at the summit, guitar and drums down the ski run.
  artie: {
    bpm: 132,
    parts: {
      lead: { inst: 'bell', mml: b('o5 l8 a4 > c < b a4 e4', 'o5 f4. e d4 e4', 'o5 a4 > c e d4 c4', 'o5 b2. r4', 'o5 a4 b > c d4 e4', 'o6 f4 e d c4 < b4', 'o5 a4 g4 e4 g4', 'o5 a1') },
      arp: { inst: 'harp', vol: 0.8, pan: -0.35, mml: arp(4, [['ace', 'a'], ['dfa', 'd'], ['fac', 'f'], ['eg+b', 'e'], ['ace', 'a'], ['dfa', 'd'], ['ceg', 'c'], ['ace', 'a']]) },
      pad: { inst: 'slowstrings', vol: 0.7, pan: 0.3, mml: pad(4, ['ace', 'dfa', 'fa>c', 'eg+b', 'ace', 'dfa', 'ceg', 'ace']) },
      bass: { inst: 'bass', mml: bass(2, 'R4 R8 R8 F4 R4', ['a/e', 'd/a', 'f/c', 'e/b', 'a/e', 'd/a', 'c/g', 'a/e']) },
      drums: { inst: 'kick', drums: true, not: ['ski'], mml: rep('k8 y8 s8 y8 k8 k8 s8 y8', 8) },
      drive: { inst: 'kick', drums: true, only: ['ski'], mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      toms: { inst: 'kick', drums: true, only: ['tram'], mml: rep('r2 r4 t8 u8', 8) },
    },
    arrangements: {
      trail: {},
      tram: { inst: { lead: 'flute', pad: 'strings' } },
      summit: { inst: { lead: 'brass', pad: 'choir' } },
      ski: { inst: { lead: 'guitar', pad: 'strings', arp: 'bell' }, vol: { arp: 0.5 } },
    },
  },

  // Victor: tribal drums and marimba on the cliffs; a club track at Club Caldera; big and dark inside the volcano; the party in the lounge.
  victor: {
    bpm: 118,
    parts: {
      lead: { inst: 'marimba', mml: b('o5 l8 d4 f g a4 g f', 'o5 g4 f d c2', 'o5 d4 f g a4 > c d', 'o5 a2. r4', 'o5 b4 a g f4 g4', 'o5 a4 g f e4 d4', 'o5 c4 d e f4 e4', 'o5 d1') },
      bass: { inst: 'synthbass', mml: bass(2, 'R8. R16 r8 R8 O8 R8 r8 R8', ['d', 'c', 'd', 'a', 'g', 'a', 'c', 'd']) },
      congas: { inst: 'kick', drums: true, not: ['club', 'lounge'], mml: rep('c8 c16 c16 d8 c8 r8 c8 d8 d8', 8) },
      toms: { inst: 'kick', drums: true, only: ['cliffs', 'inside'], mml: rep('u8 r8 u8 t8 u4 u8 t8', 8) },
      club: { inst: 'kick', drums: true, only: ['club', 'lounge'], mml: rep(FOUR, 8) },
      stabs: { inst: 'epiano', vol: 0.7, pan: -0.3, only: ['club', 'lounge'], mml: skank(4, ['dfa', 'ceg', 'dfa', 'ace', 'gb>d', 'ace', 'ceg', 'dfa']) },
      pad: { inst: 'choir', vol: 0.6, pan: 0.3, only: ['inside'], mml: pad(4, ['dfa', 'ceg', 'dfa', 'ace', 'gb>d', 'ace', 'ceg', 'dfa']) },
    },
    arrangements: {
      cliffs: {},
      club: { inst: { lead: 'sax' } },
      inside: { inst: { lead: 'brass' } },
      lounge: { inst: { lead: 'trumpet' } },
    },
  },

  // Ernie: San Francisco funk (slap bass, clav, a horn section); the bridge coming down; surf guitar across the bay; organ on the tour.
  ernie: {
    bpm: 112,
    parts: {
      lead: { inst: 'brass', pan: 0.2, mml: b('o5 l8 e r e g a4 b4', 'o6 d4 < b a g4 e4', 'o5 e r e g a4 b4', 'o6 d e d < b a2', 'o5 g4 a b > c+4 < b4', 'o5 a4 g e g2', 'o5 f+4 g a b4 a4', 'o5 e2. r4') },
      bass: { inst: 'slap', mml: bass(2, 'R8 r16 R16 O8 R8 r16 R16 F8 R8 O8', ['e/b', 'a/e', 'e/b', 'a/e', 'c/g', 'a/e', 'd/a', 'e/b']) },
      clav: { inst: 'clav', vol: 0.8, pan: -0.35, not: ['cell'], mml: stabs(4, ['egbd', 'ac+eg', 'egbd', 'ac+eg', 'cegb', 'aceg', 'df+ac', 'egbd']) },
      drums: { inst: 'kick', drums: true, not: ['bridge', 'bay'], mml: rep(FUNK, 8) },
      bridge: { inst: 'kick', drums: true, only: ['bridge'], mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      timp: { inst: 'timpani', only: ['bridge'], mml: rep('o2 e4 r4 e8 e8 r4', 8) },
      surf: { inst: 'kick', drums: true, only: ['bay'], mml: rep('{kh}8 h8 {sh}8 {kh}8 r8 k8 {sh}8 h8', 8) },
      pad: { inst: 'strings', vol: 0.6, only: ['bridge', 'cell'], mml: pad(4, ['egb', 'ac+e', 'egb', 'ac+e', 'ceg', 'ace', 'df+a', 'egb']) },
    },
    arrangements: {
      streets: {},
      bridge: { inst: { lead: 'trumpet' } },
      bay: { inst: { lead: 'guitar', clav: 'nylon' } },
      cell: { inst: { lead: 'organ', bass: 'bass' }, vol: { drums: 0.6 } },
    },
  },

  // Hector: Miami, salsa. Steel drum and piano on the beach; minor and stormy when the storm hits; choir up the storm tower.
  hector: {
    bpm: 124,
    parts: {
      lead: { inst: 'steel', mml: b('o5 l8 c e g a4 g e c', 'o5 d4 f a g2', 'o5 c e g a4 > c < a g', 'o5 e2. r4', 'o5 f4 a > c < b4 g4', 'o5 e4 g a g4 e4', 'o5 d4 e f g4 b4', 'o6 c1') },
      montuno: { inst: 'piano', vol: 0.7, pan: -0.35, mml: [['ceg', 'e'], ['dfa', 'f'], ['ceg', 'e'], ['ceg', 'e'], ['fac', 'a'], ['ceg', 'e'], ['gbd', 'b'], ['ceg', 'e']].map(([c, t]) => `o4 {${c}}8 ${t}8 r8 {${c}}8 r8 ${t}8 {${c}}8 r8`).join(' | ') },
      bass: { inst: 'bass', mml: bass(2, 'R4. F8 r8 O8 F4', ['c/g', 'd/a', 'c/g', 'c/g', 'f/c', 'c/g', 'g/d', 'c/g']) },
      perc: { inst: 'kick', drums: true, not: ['storm', 'tower'], mml: rep('{kw}8 b8 c8 {bw}8 {kd}8 b8 c8 {cw}8', 8) },
      storm: { inst: 'kick', drums: true, only: ['storm', 'tower'], mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      horns: { inst: 'brass', vol: 0.7, pan: 0.3, only: ['beach', 'boat'], mml: rep('o4 r2 r8 {ceg}8 {ceg}8 r8 | o4 r2 r8 {dfa}8 {dfa}8 r8', 4) },
      pad: { inst: 'choir', vol: 0.6, only: ['tower'], mml: pad(4, ['ceg', 'dfa', 'ceg', 'ceg', 'fac', 'ceg', 'gbd', 'ceg']) },
      str: { inst: 'strings', vol: 0.6, only: ['storm'], mml: pad(4, ['ce-g', 'dfa-', 'ce-g', 'ce-g', 'fa-c', 'ce-g', 'gbd', 'ce-g']) },
    },
    arrangements: {
      beach: {},
      storm: { inst: { lead: 'trumpet', montuno: 'organ' } },
      boat: { inst: { lead: 'steel' } },
      tower: { inst: { lead: 'brass', montuno: 'strings' }, vol: { montuno: 0.5 } },
      daycare: { mute: ['perc'], inst: { lead: 'bell', montuno: 'harp' } },
    },
  },

  // Tommy: Flint. A slow, heavy boom-bap on the corner; the same, faster and harder on the bike; hollow and dripping in the sewer.
  tommy: {
    bpm: 92,
    parts: {
      lead: { inst: 'organ', mml: b('o5 l8 c4 e- f g4 f e-', 'o5 c2 r4 < b- > c', 'o5 e- f g b- a-4 g4', 'o5 f2. r4', 'o5 c4 e- f g4 b-4', 'o5 a-4 g f e-4 d4', 'o5 c4 e- d c4 < b-4', 'o5 c1') },
      keys: { inst: 'epiano', vol: 0.7, pan: -0.3, not: ['sewer'], mml: pad(4, ['ce-gb-', 'ce-gb-', 'e-gb-', 'fa-c', 'ce-g', 'fa-c', 'a-ce-', 'ce-g'], '2 r2') },
      bass: { inst: 'bass', mml: bass(1, 'R4. R8 r8 O8 R4', ['c', 'c', 'e-', 'f', 'c', 'f', 'a-', 'c']) },
      drums: { inst: 'kick', drums: true, not: ['sewer', 'road'], mml: rep(BOOM, 8) },
      road: { inst: 'kick', drums: true, only: ['road'], mml: rep('{kh}16 h16 h16 k16 {sh}16 h16 k16 h16 h16 k16 k16 h16 {sh}16 h16 h16 {sh}16', 8) },
      scratch: { inst: 'kick', drums: true, only: ['hood', 'road', 'ruins'], mml: rep('r1 | r1 | r1 | r2 r4 g8 g8', 2) },
      drip: { inst: 'kick', drums: true, only: ['sewer'], mml: rep('m8 r8 r4 r8 m8 r4', 8) },
      pad: { inst: 'pad', vol: 0.8, only: ['sewer'], mml: pad(3, ['ce-g', 'ce-g', 'e-gb-', 'fa-c', 'ce-g', 'fa-c', 'a-ce-', 'ce-g']) },
    },
    arrangements: {
      hood: {},
      road: { inst: { lead: 'guitar' } },
      sewer: { inst: { lead: 'bell' }, vol: { lead: 0.7 } },
      ruins: { inst: { lead: 'brass' } },
    },
  },

  // Barry: New York noir. Walking bass and a sax on the street; elevator music in the office tower; brass on the roofs; tense in the power room.
  barry: {
    bpm: 128,
    parts: {
      lead: { inst: 'sax', mml: b('o5 l8 f4 a- b- > c4 < b- a-', 'o5 g4 f e- f2', 'o5 f4 a- b- > c e- d- c', 'o5 b-2. r4', 'o5 a-4 b- > c d-4 c4', 'o5 b-4 a- g f4 e-4', 'o5 d-4 e- f g4 e-4', 'o5 f1') },
      walk: { inst: 'bass', mml: b('o2 l4 f a- b- > c', 'o2 l4 b- a- g e-', 'o2 l4 f a- b- > c', 'o2 l4 e- d- c < b-', 'o2 l4 d- f a- f', 'o2 l4 b- a- g e-', 'o2 l4 d- e- f g', 'o2 l4 f c e- e') },
      comp: { inst: 'piano', vol: 0.65, pan: -0.3, mml: skank(4, ['fa-c', 'e-gb-', 'fa-c', 'e-gb-', 'd-fa-', 'e-gb-', 'd-fa-', 'fa-c']) },
      drums: { inst: 'kick', drums: true, not: ['tower'], mml: rep('{kh}8 h16 h16 {sh}8 h8 {kh}8 h16 h16 {sh}8 {hz}8', 8) },
      bossa: { inst: 'kick', drums: true, only: ['tower'], mml: rep('{km}8 z8 z8 {kmz}8 z8 {km}8 z8 {mz}8', 8) },
      horns: { inst: 'brass', vol: 0.7, pan: 0.3, only: ['roofs'], mml: rep('o4 r2 {fa-c}4 r8 {fa-c}8 | o4 r2 {e-gb-}4 r4', 4) },
      str: { inst: 'strings', vol: 0.7, only: ['power'], mml: rep('o4 l16 f f f f f f f f a- a- a- a- a- a- a- a- | o4 l16 g g g g g g g g e- e- e- e- e- e- e- e-', 4) },
    },
    arrangements: {
      streets: {},
      tower: { inst: { lead: 'epiano', comp: 'bell' }, vol: { comp: 0.5, walk: 0.8 } },
      roofs: { inst: { lead: 'trumpet' } },
      power: { inst: { lead: 'guitar', comp: 'organ' } },
    },
  },

  // Oscar: Texas. Banjo and harmonica in the field; elevator music in the break room; the chase is southern rock; honky-tonk at the bar.
  oscar: {
    bpm: 140,
    parts: {
      lead: { inst: 'harmonica', mml: b('o5 l8 e4 g+ a b4 a g+', 'o5 f+4 e d e2', 'o5 e4 g+ a b4 > d c+', 'o5 b2. r4', 'o5 a4 b > c+ d4 c+ < b', 'o5 a4 g+ f+ e4 d4', 'o5 c+4 d e f+4 g+4', 'o5 a1') },
      banjo: { inst: 'banjo', vol: 0.8, pan: -0.35, not: ['break'], mml: [['eg+b', 'e'], ['df+a', 'd'], ['eg+b', 'e'], ['eg+b', 'e'], ['ac+e', 'a'], ['df+a', 'd'], ['ac+e', 'a'], ['ac+e', 'a']].map(([c, t]) => { const n = notes(c); return `o4 l16 ${n[0]} ${n[1]} ${n[2]} o5 ${t} o4 ${n[1]} ${n[2]} o5 ${t} o4 ${n[1]} ${n[0]} ${n[1]} ${n[2]} o5 ${t} o4 ${n[2]} ${n[1]} ${n[0]} ${n[2]}`; }).join(' | ') },
      bass: { inst: 'bass', mml: bass(2, 'R4 F4 R4 F4', ['e/b', 'd/a', 'e/b', 'e/b', 'a/e', 'd/a', 'a/e', 'a/e']) },
      drums: { inst: 'kick', drums: true, not: ['break', 'chase'], mml: rep(TRAIN, 8) },
      chase: { inst: 'kick', drums: true, only: ['chase'], mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      power: { inst: 'power', vol: 0.8, only: ['chase'], mml: bass(2, 'R8 R8 r8 R8 R4 R8 R8', ['e', 'd', 'e', 'e', 'a', 'd', 'a', 'a']) },
      muzak: { inst: 'kick', drums: true, only: ['break'], mml: rep('{km}8 z8 z8 {kz}8 m8 z8 z8 z8', 8) },
      keys: { inst: 'piano', vol: 0.7, only: ['end'], mml: skank(4, ['eg+b', 'df+a', 'eg+b', 'eg+b', 'ac+e', 'df+a', 'ac+e', 'ac+e']) },
    },
    arrangements: {
      field: {},
      break: { inst: { lead: 'epiano', bass: 'bass' }, vol: { lead: 0.8 } },
      chase: { inst: { lead: 'guitar', banjo: 'banjo' }, vol: { banjo: 0.6 } },
      end: { inst: { lead: 'piano' } },
    },
  },

  // Dale: a spaghetti western. Whistling out in the desert; driving, with a trumpet, down the highway; the full showdown in town.
  dale: {
    bpm: 100,
    parts: {
      lead: { inst: 'whistle', mml: b('o5 l8 d4. a a4 g f', 'o5 e4. f d2', 'o5 d4. a > c4 < b- a', 'o5 a2. r4', 'o5 b-4. a g4 f e', 'o5 f4. g a2', 'o5 g4 f e d4 c+4', 'o5 d1') },
      gtr: { inst: 'nylon', vol: 0.8, pan: -0.35, mml: [['dfa', 'd'], ['c+eg', 'c+'], ['dfa', 'd'], ['c+ea', 'a'], ['gb-d', 'g'], ['dfa', 'd'], ['c+eg', 'c+'], ['dfa', 'd']].map(([c]) => `o3 {${c}}4 {${c}}8 {${c}}8 {${c}}4 {${c}}8 {${c}}8`).join(' | ') },
      bass: { inst: 'bass', mml: bass(2, 'R4 r8 F8 R4 F4', ['d/a', 'a/e', 'd/a', 'a/e', 'g/d', 'd/a', 'a/e', 'd/a']) },
      timp: { inst: 'timpani', vol: 0.8, not: ['highway'], mml: rep('o2 d4 r2. | o2 a4 r2. ', 4) },
      drums: { inst: 'kick', drums: true, only: ['desert'], mml: rep('k8 r8 m8 r8 k8 k8 m8 r8', 8) },
      road: { inst: 'kick', drums: true, only: ['highway'], mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      choir: { inst: 'choir', vol: 0.6, only: ['town'], mml: pad(4, ['dfa', 'c+eg', 'dfa', 'c+ea', 'gb->d', 'dfa', 'c+eg', 'dfa']) },
      bells: { inst: 'bell', vol: 0.5, only: ['town'], mml: rep('o5 d2 r2 | o4 a2 r2', 4) },
    },
    arrangements: {
      desert: {},
      highway: { inst: { lead: 'trumpet', gtr: 'power' }, vol: { gtr: 0.5 } },
      town: { inst: { lead: 'trumpet' } },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // The bosses: one hard-driving theme, arranged for each of them (the lead and the colors are his stage's).
  boss: {
    bpm: 160,
    parts: {
      riff: { inst: 'power', vol: 0.85, pan: -0.3, mml: rep('o2 l8 b b > d < b > e < b > f+ < b | o2 l8 b b > d < b > g f+ e d', 4) },
      bass: { inst: 'bass', mml: rep('o2 l8 b b b b b b b b | o2 l8 g g g g f+ f+ f+ f+', 4) },
      lead: { inst: 'brass', pan: 0.2, mml: b('o5 l8 b4. > d c+4 < b4', 'o5 a4 g f+ g2', 'o5 b4. > d e4 f+4', 'o6 e2. r4', 'o6 g4. f+ e4 d4', 'o6 c+4 < b a+ b2', 'o5 g4 a b > c+4 d4', 'o6 c+2 < a+2') },
      drums: { inst: 'kick', drums: true, mml: b('{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      hits: { inst: 'hit', vol: 0.8, mml: rep('o4 b4 r2. | r1', 4) },
      color: { inst: 'strings', vol: 0.6, pan: 0.35, mml: rep('o4 l16 [b > d f+ <]5 b | o4 l16 g b > d < g b > d < g b > d < f+ a+ > c+ < f+ a+ > c+ < f+', 4) },
    },
    arrangements: {
      'Artie Avalanche': { inst: { lead: 'bell', color: 'harp' } },
      'Victor Volcano': { inst: { lead: 'brass', color: 'marimba' } },
      'Ernie Earthquake': { inst: { lead: 'trumpet', color: 'clav' } },
      'Hector Hurricane': { inst: { lead: 'steel', color: 'strings' } },
      'Toxic Tommy': { inst: { lead: 'organ', color: 'epiano' } },
      'Blackout Barry': { inst: { lead: 'sax', color: 'strings' } },
      'Oily Oscar': { inst: { lead: 'harmonica', color: 'banjo' } },
      'Drug Trade Dale': { inst: { lead: 'trumpet', color: 'nylon' } },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // The finale (the alien who wore the President): his own theme, not the bosses' one. D minor, a saucer-organ tune
  // wobbling over a clav arpeggio and a driving synth bass, an eerie choir under it all; then the second half, the
  // presidential fanfare he's been hiding behind, turned sour in brass. Begging, it's all stripped away: the tune on
  // its own, slow and thin, the choir hanging on.
  imposter: {
    bpm: 152,
    parts: {
      lead: { inst: 'organ', pan: 0.15, mml: b(
        'o5 d4. f8 a4 g8 f8', 'o5 e4 f8 e8 d2', 'o5 d4. f8 b-4 a8 g8', 'o5 a2. r4',
        'o5 a4. > c8 d4 c8 < a8', 'o5 g4 a8 g8 f2', 'o5 e4 f8 g8 b-4 a4', 'o5 c+2 < a2',
        'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1') },
      fanfare: { inst: 'brass', pan: -0.15, mml: b(
        'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1',
        'o5 f8 f16 f16 b-4 f4 d4', 'o5 g8 g16 g16 > c4 < g4 e4', 'o5 a4. g8 f4 e4', 'o5 d2. r4',
        'o5 f8 f16 f16 b-4 > d4 c8 < b-8', 'o5 a4 g8 a8 > c2', 'o5 c+4 e4 a4 g4', 'o5 e2 c+4 < a4') },
      ost: { inst: 'clav', vol: 0.7, pan: -0.35, mml: arp(4, [
        ['dfa', 'd'], ['dfa', 'd'], ['dfb-', 'd'], ['c+ea', 'c+'], ['dfa', 'd'], ['dfa', 'd'], ['dgb-', 'd'], ['c+ea', 'c+'],
        ['dfb-', 'd'], ['ceg', 'c'], ['dfa', 'd'], ['dfa', 'd'], ['dfb-', 'd'], ['ceg', 'c'], ['c+ea', 'c+'], ['c+ea', 'c+']]) },
      bass: { inst: 'synthbass', mml: bass(2, 'R8 R8 O8 R8 R8 R8 O8 F8', [
        'd/a', 'd/a', 'b-/f', 'a/e', 'd/a', 'd/a', 'g/d', 'a/e', 'b-/f', 'c/g', 'd/a', 'd/a', 'b-/f', 'c/g', 'a/e', 'a/e']) },
      choir: { inst: 'choir', vol: 0.55, pan: 0.3, mml: pad(4, ['dfa', 'dfa', 'dfb-', 'c+ea', 'dfa', 'dfa', 'dgb-', 'c+ea', 'dfb-', 'ceg', 'dfa', 'dfa', 'dfb-', 'ceg', 'c+ea', 'c+ea']) },
      hits: { inst: 'timpani', vol: 0.8, mml: ['d', 'd', 'b-', 'a', 'd', 'd', 'g', 'a', 'b-', 'c', 'd', 'd', 'b-', 'c', 'a', 'a'].map(r => `o2 ${r}4 r2.`).join(' | ') },
      drums: { inst: 'kick', drums: true, mml: b('{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL,
        '{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, ROCK_FILL, '{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, 's16 s16 s16 s16 t16 t16 u16 u16 {kx}4 {kx}4') },
    },
    arrangements: {
      fight: {},
      // (begging: just the tune, on something thin and sorry, and the choir; everything else gone)
      plead: { inst: { lead: 'flute', fanfare: 'harmonica' }, mute: ['ost', 'bass', 'hits', 'drums'], vol: { choir: 0.8 } },
    },
  },

  // A mid-boss (the moose, the doorman, the Eye, Chuco, the thing in the cistern): tense, pounding.
  midboss: {
    bpm: 150,
    parts: {
      ost: { inst: 'strings', vol: 0.8, pan: -0.3, mml: rep('o4 l16 e e g e a e g e b e a e g e f+ e', 4) + ' | ' + rep('o4 l16 c c e c f c e c g c f c e c d c', 2) + ' | ' + rep('o4 l16 d+ d+ f+ d+ a d+ f+ d+ b d+ a d+ f+ d+ e d+', 2) },
      bass: { inst: 'synthbass', mml: b('o2 l8 e e e e e e e e', 'o2 l8 e e e e e e e e', 'o2 l8 e e e e e e e e', 'o2 l8 e e e e e e e e', 'o2 l8 c c c c c c c c', 'o2 l8 c c c c c c c c', 'o1 l8 b b b b b b b b', 'o1 l8 b b b b b b b b') },
      toms: { inst: 'kick', drums: true, mml: rep('{ku}8 u8 t8 u8 {ku}8 t8 {su}8 t8', 7) + ' | s16 s16 s16 s16 t16 t16 u16 u16 {kx}4 {kx}4' },
      brass: { inst: 'brass', vol: 0.8, pan: 0.3, mml: b('o4 {egb}4 r2.', 'r1', 'o4 {egb}4 r4 {egb}8 {egb}8 r4', 'r1', 'o4 {ceg}4 r2.', 'o4 {ceg}8 {ceg}8 r4 r2', 'o3 {bd+f+}4 r2.', 'o3 {bd+f+}2. r4') },
    },
  },

  // Boss down: a short victory fanfare.
  victory: {
    bpm: 150, once: true,
    parts: {
      lead: { inst: 'trumpet', mml: 'o5 l16 c c c8 c8 < g8 > c4 r8 e8 g2' },
      harm: { inst: 'brass', vol: 0.8, mml: 'o4 l16 g g g8 g8 e8 g4 r8 > c8 e2' },
      low: { inst: 'bass', mml: 'o2 l16 c c c8 c8 < g8 > c4 r8 c8 c2' },
      drums: { inst: 'kick', drums: true, mml: 's16 s16 s8 s8 s8 {kx}4 r8 k8 {kx}2' },
    },
  },

  // Died: a sad trombone, more or less.
  death: {
    bpm: 84, once: true,
    parts: {
      lead: { inst: 'brass', mml: 'o4 l4 g f+ f e2.' },
      low: { inst: 'bass', mml: 'o2 l4 g f+ f e2.' },
    },
  },

  // The weapon screen (and its firing range): upbeat, bouncy.
  weapon: {
    bpm: 128,
    parts: {
      lead: { inst: 'organ', mml: b('o5 l8 g4 b > d c4 < a4', 'o5 g4 e d g2', 'o5 g4 b > d e4 d4', 'o6 c2 < b2', 'o5 a4 b > c d4 c4', 'o5 b4 a g a2', 'o5 f+4 g a b4 a4', 'o5 g1') },
      bass: { inst: 'slap', mml: bass(2, 'R8 r8 O8 R8 F8 R8 O8 F8', ['g/d', 'e/b', 'g/d', 'c/g', 'a/e', 'e/b', 'd/a', 'g/d']) },
      keys: { inst: 'epiano', vol: 0.7, pan: -0.3, mml: stabs(4, ['gb>d', 'egb', 'gb>d', 'ceg', 'ace', 'egb', 'df+a', 'gb>d']) },
      drums: { inst: 'kick', drums: true, mml: rep(FUNK, 8) },
    },
  },

  // The briefings (the intro, and the man on the radio): a sneaky spy groove. Darker on the radio.
  briefing: {
    bpm: 96,
    parts: {
      bass: { inst: 'bass', mml: rep('o2 l8 c r c e- g r f e- | o2 l8 c r c e- f g a- g', 4) },
      vibes: { inst: 'bell', vol: 0.5, pan: 0.3, mml: rep('o5 l8 r4 g r r4 f+ r | o5 l8 r4 g r r4 a- r', 4) },
      lead: { inst: 'trumpet', vol: 0.8, mml: b('o5 l8 c4. e- g2', 'o5 f4 e- d e-2', 'o5 c4. e- g4 b-4', 'o5 a-2. r4', 'o5 g4. f e-4 d4', 'o5 e-4 d c d2', 'o5 c4 d e- f4 d4', 'o5 c1') },
      drums: { inst: 'kick', drums: true, mml: rep(LIGHT, 8) },
      pad: { inst: 'strings', vol: 0.5, mml: pad(4, ['ce-g', 'ce-g', 'ce-g', 'fa-c', 'ce-g', 'ce-g', 'a-ce-', 'ce-g']) },
    },
    arrangements: {
      main: {},
      radio: { inst: { lead: 'organ', vibes: 'epiano', pad: 'pad' }, mute: ['drums'], vol: { lead: 0.8 } },
    },
  },
};
